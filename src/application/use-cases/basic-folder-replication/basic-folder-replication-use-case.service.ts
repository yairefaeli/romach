import { BasicFoldersRepositoryInterface } from 'src/application/interfaces/basic-folder/basic-folder.interface';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entites-api/romach-entities-api.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { RetryUtils } from '../../../utils/RetryUtils/RetryUtils';
import { RxJsUtils } from '../../../utils/RxJsUtils/RxJsUtils';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { FlowUtils } from '../../../utils/FlowUtils/FlowUtils';
import { from, switchMap, timer } from 'rxjs';
import { Result } from 'rich-domain';
import { reduce } from 'lodash';

export type BasicFolderReplicationHandlerFn = (basicFolders: BasicFolder[]) => Result<void> | Promise<Result<void>>;

export interface BasicFoldersReplicationUseCaseOptions {
    romachApi: RomachEntitiesApiInterface;
    romachBasicFolderRepositoryInterface: BasicFoldersRepositoryInterface;
    leaderElection: LeaderElectionInterface;
    pollInterval: number;
    retryInterval: number;
    maxRetry: number;
    handler: BasicFolderReplicationHandlerFn;
    logger: AppLoggerService;
}

export class BasicFoldersReplicationUseCase {
    private timestamp: Timestamp;

    constructor(private options: BasicFoldersReplicationUseCaseOptions) {}

    execute() {
        return this.options.leaderElection
            .isLeader()
            .pipe(
                RxJsUtils.executeOnTrue(
                    timer(0, this.options.pollInterval).pipe(switchMap((_) => from(this.replication()))),
                ),
            );
    }

    private async replication() {
        const currentTimestampResult = await this.getCurrentTimestamp();

        if (currentTimestampResult.isFail()) {
            await FlowUtils.delay(this.options.retryInterval);
            return;
        }

        this.timestamp = currentTimestampResult.value() ?? Timestamp.ts1970();

        const result = await this.fetchBasicFolders();
        if (result.isFail()) {
            await FlowUtils.delay(this.options.retryInterval);
            return;
        }

        const basicFolders = result.value();

        const handlerResult = await this.options.handler(basicFolders);

        if (handlerResult.isFail()) {
            await FlowUtils.delay(this.options.retryInterval);
            return;
        }

        const nextTimestamp = this.nextTimestamp(basicFolders);

        const saveTimestampResult = await this.saveTimestamp(nextTimestamp);

        if (saveTimestampResult.isFail()) {
            await FlowUtils.delay(this.options.retryInterval);
            return;
        }

        await FlowUtils.delay(this.options.pollInterval);
    }

    private async getCurrentTimestamp() {
        const currentTimestampResult = await RetryUtils.retry(
            () => this.options.romachBasicFolderRepositoryInterface.getBasicFoldersTimestamp(),
            this.options.maxRetry,
            this.options.logger,
        );

        if (currentTimestampResult.isFail()) {
            this.options.logger.error(`error getting basic folders timestamp: ${currentTimestampResult.error()}`);
        } else {
            this.options.logger.debug(`read timestamp from repository: ${currentTimestampResult.value()}`);
        }

        return currentTimestampResult;
    }

    private async saveTimestamp(timestamp: Timestamp) {
        const saveTimestampResult = await RetryUtils.retry(
            () => this.options.romachBasicFolderRepositoryInterface.saveBasicFoldersTimestamp(timestamp),
            this.options.maxRetry,
            this.options.logger,
        );

        if (saveTimestampResult.isFail()) {
            this.options.logger.error(`error saving basic folders timestamp: ${saveTimestampResult.error()}`);
        } else {
            this.options.logger.debug(`saved timestamp: ${this.timestamp.toString()}`);
        }

        return saveTimestampResult;
    }

    private async fetchBasicFolders() {
        const foldersResult = await RetryUtils.retry(
            () => this.options.romachApi.fetchBasicFoldersByTimestamp(this.timestamp),
            this.options.maxRetry,
            this.options.logger,
        );

        if (foldersResult.isFail()) {
            this.options.logger.error(`error fetching basic folders: ${foldersResult.error()}`);
        } else {
            this.options.logger.debug(
                `fetched basic folders from ${this.timestamp.toString()} count ${foldersResult.value().length}`,
            );
            return foldersResult;
        }
    }

    private nextTimestamp(basicFolders: BasicFolder[]) {
        return reduce(
            basicFolders,
            (acc, curr) => {
                const currTimestamp = curr.getProps().updatedAt;
                return currTimestamp.isAfter(acc) ? currTimestamp : acc;
            },
            this.timestamp,
        );
    }
}
