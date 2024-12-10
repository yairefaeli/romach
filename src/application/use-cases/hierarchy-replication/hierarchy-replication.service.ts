import { BasicFoldersRepositoryInterface } from 'src/application/interfaces/basic-folders-repository/basic-folders-repository.interface';
import { HierarchiesRepositoryInterface } from 'src/application/interfaces/hierarchies-repository/hierarchies-repository.interface';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entites-api/romach-entities-api.interface';
import { TreeCalculationService } from 'src/domain/services/tree-calculation/tree-calculation.service';
import { catchError, concatMap, filter, map, retry, switchMap, tap } from 'rxjs/operators';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { EMPTY, from, Observable, of, OperatorFunction, timer } from 'rxjs';
import { RetryUtils } from '../../../utils/RetryUtils/RetryUtils';
import { RxJsUtils } from '../../../utils/RxJsUtils/RxJsUtils';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { RealityId } from '../../entities/reality-id';
import { isEqual } from 'lodash';

export interface HierarchyReplicationServiceOptions {
    interval: number;
    maxRetry: number;
    reality: RealityId;
    logger: AppLoggerService;
    leaderElection: LeaderElectionInterface;
    romachEntitiesApi: RomachEntitiesApiInterface;
    treeCalculationService: TreeCalculationService;
    hierarchyRepositoryInterface: HierarchiesRepositoryInterface;
    basicFolderRepositoryInterface: BasicFoldersRepositoryInterface;
}

export class HierarchyReplicationService {
    constructor(private options: HierarchyReplicationServiceOptions) {}

    execute() {
        this.options.logger.info(
            `HierarchyReplicationService has been initialized for reality ${this.options.reality}`,
        );
        return this.options.leaderElection.isLeader().pipe(
            tap((isLeader) =>
                this.options.logger.info(`hierarchyLeaderElection leader has changed. current status: ${isLeader}`),
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
                tap(() => this.options.logger.debug(`Handling hierarchy for reality ${this.options.reality}`)),
                this.fetcher(),
                this.readCurrentHierarchies(),
                this.differ(),
                this.calcTree(),
                this.saver(),
            );
    }

    private fetcher(): OperatorFunction<unknown, Hierarchy[]> {
        return (source: Observable<unknown>) => {
            return source.pipe(
                concatMap((_) =>
                    from(this.options.romachEntitiesApi.fetchHierarchies()).pipe(
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

    private readCurrentHierarchies(): OperatorFunction<Hierarchy[], { curr: Hierarchy[]; next: Hierarchy[] }> {
        return (source: Observable<Hierarchy[]>) =>
            source.pipe(
                switchMap((newHierarchy) =>
                    from(this.options.hierarchyRepositoryInterface.getHierarchies()).pipe(
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

    private differ(): OperatorFunction<{ curr: Hierarchy[]; next: Hierarchy[] }, Hierarchy[]> {
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
                    from(this.options.hierarchyRepositoryInterface.saveHierarchies(newHierarchy)).pipe(
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

    private calcTree(): OperatorFunction<Hierarchy[], Hierarchy[]> {
        return (source: Observable<Hierarchy[]>) => {
            return source.pipe(
                switchMap((newHierarchy) =>
                    from(this.getCurrentFoldersFromRepository()).pipe(
                        switchMap((currentFolders) => {
                            this.options.treeCalculationService.calculateTree(currentFolders, newHierarchy);
                            this.options.logger.info(
                                `Hierarchy calculated for reality ${this.options.reality}, count: ${newHierarchy.length}`,
                            );

                            return of(newHierarchy);
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
            );
        };
    }

    private async getCurrentFoldersFromRepository() {
        const result = await RetryUtils.retry(
            () => this.options.basicFolderRepositoryInterface.getBasicFolders(),
            this.options.maxRetry,
            this.options.logger,
        );
        if (result.isFail()) {
            throw new Error(`Failed to fetch current folders from repository: ${result.error()}`);
        }
        this.options.logger.info(`Fetched ${result.value().length} current folders from repository.`);
        return result.value();
    }
}
