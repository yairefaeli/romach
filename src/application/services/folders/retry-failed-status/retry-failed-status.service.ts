import { RegisteredFolderRepositoryInterface } from '../../../interfaces/registered-folders-repository/registered-folder-repository.interface';
import { RomachEntitiesApiInterface } from '../../../interfaces/romach-entites-api/romach-entities-api.interface';
import { AppLoggerService } from '../../../../infra/logging/app-logger.service';
import { RegisteredFolder } from '../../../../domain/entities/RegisteredFolder';
import { RetryUtils } from '../../../../utils/RetryUtils/RetryUtils';
import { Result } from 'rich-domain';
import { isEmpty } from 'lodash';

export interface RetryFailedStatusServiceOptions {
    logger: AppLoggerService;
    registeredFolderRepositoryInterface: RegisteredFolderRepositoryInterface;
    maxRetry: number;
    retryInterval: number;
    romachEntitiesApi: RomachEntitiesApiInterface;
}

export class RetryFailedStatusService {
    constructor(private options: RetryFailedStatusServiceOptions) {}

    async retryFailedStatus() {
        this.options.logger.info('Starting retry process for registered folders with failed statuses');

        const failedFoldersResult = await this.fetchFailedRegisteredFolders();

        if (failedFoldersResult?.isFail()) {
            this.options.logger.error('Failed to fetch failed registered folders.');
        }

        const failedFolders = failedFoldersResult?.value() || [];
        if (isEmpty(failedFolders)) {
            this.options.logger.info('No failed registered folders found for retry.');
        }

        const batchResult = await this.retryFoldersInBatch(failedFolders);

        if (batchResult?.isFail()) {
            this.options.logger.error('Failed to do retry folders');
        }

        setTimeout(() => this.retryFailedStatus(), this.options.retryInterval);
    }

    private async fetchFailedRegisteredFolders(): Promise<Result<RegisteredFolder[]>> {
        return RetryUtils.retry(
            () => this.options.registeredFolderRepositoryInterface.getRegisteredFoldersWithFailedStatus(),
            this.options.maxRetry,
            this.options.logger,
        ).then((result) => {
            if (result.isFail()) {
                this.options.logger.error(`Failed to fetch registered folders with failed statuses: ${result.error()}`);
            }
            return result;
        });
    }

    private async retryFoldersInBatch(failedFolders: RegisteredFolder[]): Promise<Result<void>> {
        this.options.logger.info(`Retrying a batch of ${failedFolders?.length} failed folders.`);

        const succeededRegisteredFolders: RegisteredFolder[] = [];
        const failedRegisteredFolders: RegisteredFolder[] = [];
        const removeRegisteredFolders: RegisteredFolder[] = [];

        const results = await Promise.all(
            failedFolders.map((folder) => this.retryFolder(folder).then((result) => ({ folder, result }))),
        );

        results.forEach(({ folder, result }) => {
            if (result.isOk()) {
                succeededRegisteredFolders.push(folder);
            } else if (result.error()?.includes('not-found')) {
                removeRegisteredFolders.push(folder);
            } else {
                failedRegisteredFolders.push(folder);
            }
        });

        if (!isEmpty(succeededRegisteredFolders)) {
            this.options.logger.info(`Successfully retried ${succeededRegisteredFolders.length} folders.`);
            await this.options.registeredFolderRepositoryInterface.upsertRegisteredFolders(succeededRegisteredFolders);
        }

        if (!isEmpty(removeRegisteredFolders)) {
            const removeRegisterFoldersIds = removeRegisteredFolders.map(
                (foldersIds) => foldersIds.getProps().folderId,
            );
            this.options.logger.info(`Removing ${removeRegisteredFolders?.length} folders from the database.`);
            await this.deleteRegisterFoldersFromRepository(removeRegisterFoldersIds);
        }

        if (!isEmpty(failedRegisteredFolders)) {
            this.options.logger.error(`Failed to retry ${failedRegisteredFolders?.length} folders.`);
            failedRegisteredFolders.forEach((folder) => {
                this.options.logger.error(`Folder ID: ${folder.getProps().folderId} failed with error.`);
            });

            return Result.fail('Some folders failed to retry.');
        }

        return Result.Ok();
    }

    private async retryFolder(folder: RegisteredFolder): Promise<Result<void>> {
        const folderProps = folder.getProps();
        const { folderId, status, password } = folderProps;

        this.options.logger.info(`Retrying operation for folder ID: ${folderId} with status: ${status}`);

        const retryFetchResult = await RetryUtils.retry(
            () => this.options.romachEntitiesApi.fetchFolderByIdAndPassword({ folderId, password }),
            this.options.maxRetry,
            this.options.logger,
        );

        if (retryFetchResult.isFail()) {
            const error = retryFetchResult.error();
            if (error && error.includes('not found')) {
                this.options.logger.info(`Folder ID: ${folderId} not found. Marking for removal.`);
                return Result.fail(`'not found': ${folderId}`);
            }

            this.options.logger.error(`Failed to retry operation for folder ID: ${folderId}`);
            return Result.fail(`Failed to retry operation for folder ID: ${folderId}`);
        }

        this.options.logger.info(`Successfully retried operation for folder ID: ${folderId}`);
        return Result.Ok();
    }

    private async deleteRegisterFoldersFromRepository(folders: string[]): Promise<Result<void>> {
        try {
            await this.options.registeredFolderRepositoryInterface.deleteRegisteredFoldersByIds(folders);
            this.options.logger.info(`Successfully removed folders ID: ${folders} from the database.`);
            return Result.Ok();
        } catch (error) {
            this.options.logger.error(`Failed to remove folder ID: ${folders} from the database. Error: ${error}`);
            return Result.fail(`Failed to remove folder ID: ${folders}`);
        }
    }
}
