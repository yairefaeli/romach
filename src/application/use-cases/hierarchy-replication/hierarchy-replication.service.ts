import {
  catchError,
  concatMap,
  filter,
  map,
  retry,
  switchMap,
  tap,
} from 'rxjs/operators';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { EMPTY, Observable, OperatorFunction, from, of, timer } from 'rxjs';
import { RxJsUtils } from '../../../utils/RxJsUtils/RxJsUtils';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { RealityId } from '../../entities/reality-id';
import { isEqual } from 'lodash';
import { RetryUtils } from '../../../utils/RetryUtils/RetryUtils';
import { TreeCalculationService } from 'src/domain/services/tree-calculation/tree-calculation.service';

export interface HierarchyReplicationServiceOptions {
  reality: RealityId;
  interval: number;
  logger: AppLoggerService;
  romachEntitiesApi: RomachEntitiesApiInterface;
  leaderElection: LeaderElectionInterface;
  romachRepository: RomachRepositoryInterface;
  treeCalculationService: TreeCalculationService;
  maxRetry: number;
}

export class HierarchyReplicationService {
  constructor(private options: HierarchyReplicationServiceOptions) { }

  execute() {
    this.options.logger.info(
      `HierarchyReplicationService has been initialized for reality ${this.options.reality}`,
    );
    return this.options.leaderElection.isLeader().pipe(
      tap((isLeader) =>
        this.options.logger.info(
          `hierarchyLeaderElection leader has changed. current status: ${isLeader}`,
        ),
      ),
      RxJsUtils.executeOnTrue(this.poller()),
    );
  }

  private poller(): Observable<unknown> {
    return timer(0, this.options.interval).pipe(
      tap(() => this.options.logger.debug(`polling ${this.options.reality}`)),
      this.perRealityReplicator(),
    );
  }

  private perRealityReplicator(): OperatorFunction<unknown, unknown> {
    return (source: Observable<unknown>) =>
      source.pipe(
        tap(() =>
          this.options.logger.debug(
            `Handling hierarchy for reality ${this.options.reality}`,
          ),
        ),
        this.fetcher(),
        this.readCurrentHierarchies(),
        this.differ(),
        this.saver(),
        this.calcTree(), //what first - calc or saver
      );
  }

  private fetcher(): OperatorFunction<unknown, Hierarchy[]> {
    return (source: Observable<unknown>) => {
      return source.pipe(
        concatMap((_) =>
          from(this.options.romachEntitiesApi.getHierarchies()).pipe(
            tap((hierarchiesResult) => {
              if (hierarchiesResult.isFail()) {
                throw new Error('');
              } else {
                this.options.logger.info(
                  `fetched hierarchies for reality ${this.options.reality} count: ${hierarchiesResult.value().length}`,
                );
              }
            }),
            map((hierarchiesResult) => hierarchiesResult.value()),
            retry(2),
            catchError((error) => {
              this.options.logger.error(
                `Error while fetching hierarchy from romach api for reality ${this.options.reality}`,
                error,
              );
              return EMPTY;
            }),
          ),
        ),
      );
    };
  }

  private readCurrentHierarchies(): OperatorFunction<
    Hierarchy[],
    { curr: Hierarchy[]; next: Hierarchy[] }
  > {
    return (source: Observable<Hierarchy[]>) =>
      source.pipe(
        switchMap((newHierarchy) =>
          from(this.options.romachRepository.getHierarchies()).pipe(
            tap((currentHierarchyResult) => {
              if (currentHierarchyResult.isFail()) {
                throw new Error('');
              } else {
                this.options.logger.info(
                  `read hierarchies from repository for reality ${this.options.reality} count: ${currentHierarchyResult.value().length}`,
                );
              }
            }),
            retry(2),
            map((currentHierarchy) => ({
              curr: currentHierarchy.value(),
              next: newHierarchy,
            })),
            catchError((error) => {
              this.options.logger.error(
                `Error while fetching hierarchy from romach repository for reality ${this.options.reality}`,
                error,
              );
              return EMPTY;
            }),
          ),
        ),
      );
  }

  private differ(): OperatorFunction<
    { curr: Hierarchy[]; next: Hierarchy[] },
    Hierarchy[]
  > {
    return (source: Observable<{ curr: Hierarchy[]; next: Hierarchy[] }>) => {
      return source.pipe(
        tap(({ curr, next }) => {
          this.options.logger.debug(
            `Differ Got hierarchies for reality ${this.options.reality} current count: ${curr.length} next count: ${next.length}`,
          );
        }),
        filter(({ curr, next }) => !this.equal(curr, next)),
        tap(({ curr, next }) =>
          this.options.logger.info(
            `Hierarchy changed for reality ${this.options.reality} old: ${curr.length} new ${next.length}`,
          ),
        ),
        map(({ curr, next }) => next),
      );
    };
  }

  private equal(a: Hierarchy[], b: Hierarchy[]) {
    return isEqual(a, b);
  }

  private saver(): OperatorFunction<Hierarchy[], void> {
    return (source: Observable<Hierarchy[]>) => {
      return source.pipe(
        switchMap((newHierarchy) =>
          from(
            this.options.romachRepository.saveHierarchies(newHierarchy),
          ).pipe(
            tap((result) => {
              if (result.isFail()) {
                throw new Error(result.error());
              }
              this.options.logger.info(
                `Hierarchy saved for reality ${this.options.reality} count: ${newHierarchy.length}`,
              );
            }),
            retry(2),
            catchError((error) => {
              this.options.logger.error(
                `Error while saving hierarchy to database for reality ${this.options.reality}`,
                error,
              );
              return EMPTY;
            }),
            map(() => undefined),
          ),
        ),
      );
    };
  }

  private calcTree(): OperatorFunction<void, void> {
    return (source: Observable<void>) => {
      return source.pipe(
        switchMap(() =>
          from(this.getCurrentHierarchiesFromRepository()).pipe(
            switchMap((newHierarchy) =>
              from(this.getCurrentFoldersFromRepository()).pipe(
                switchMap((currentFolders) => {
                  this.options.treeCalculationService.calculateTree(currentFolders, newHierarchy);
                  this.options.logger.info(
                    `Hierarchy calculated for reality ${this.options.reality}, count: ${newHierarchy.length}`,
                  );

                  return of(void 0);
                }),
                retry(2),
                catchError((error) => {
                  this.options.logger.error(
                    `Error while calculating hierarchy for reality ${this.options.reality}`,
                    error,
                  );
                  return EMPTY;
                }),
              ),
            ),
          ),
        ),
      );
    };
  }

  private async getCurrentFoldersFromRepository() {
    const result = await RetryUtils.retry(
      () => this.options.romachRepository.getBasicFolders(),
      this.options.maxRetry,
      this.options.logger,
    );
    if (result.isFail()) {
      throw new Error(`Failed to fetch current folders from repository: ${result.error()}`);
    }
    this.options.logger.info(`Fetched ${result.value().length} current folders from repository.`);
    return result.value();
  }

  private async getCurrentHierarchiesFromRepository() {
    const result = await RetryUtils.retry(
      () => this.options.romachRepository.getHierarchies(),
      this.options.maxRetry,
      this.options.logger,
    );
    if (result.isFail()) {
      throw new Error(`Failed to fetch current hierarchies from repository: ${result.error()}`);
    }
    this.options.logger.info(`Fetched ${result.value().length} current hierarchies from repository.`);
    return result.value();
  }

}
