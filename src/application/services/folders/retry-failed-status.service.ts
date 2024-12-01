import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entites-api/romach-entities-api.interface';
import { RegisteredFolderRepositoryInterface } from 'src/application/interfaces/regsitered-folder-interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { RetryUtils } from 'src/utils/RetryUtils/RetryUtils';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Folder } from 'src/domain/entities/Folder';
import { Result } from 'rich-domain';
import { isEmpty } from 'lodash';
import { Subject } from 'rxjs';

export interface RetryFailedStatusServiceOptions {
    logger: AppLoggerService;
    registeredFolderRepositoryInterface: RegisteredFolderRepositoryInterface;
    maxRetry: number;
    retryInterval: number;
    romachEntitiesApi: RomachEntitiesApiInterface;
}

export class RetryFailedStatusService {
    private folderRetrySubject = new Subject<RegisteredFolder[]>();

    constructor(private options: RetryFailedStatusServiceOptions) {
        // Set interval for retry process every 10 minutes (600,000 ms)
        setInterval(() => this.retryFailedStatuses(), this.options.retryInterval);

        // Listen to the retry requests and process them in batches using debounce
        this.folderRetrySubject
            .pipe(
                debounceTime(5000), // Wait for 5 seconds before processing the batch
                switchMap(async (failedFolders: RegisteredFolder[]) => await this.retryFoldersInBatch(failedFolders)),
            )
            .subscribe();
    }

    private async retryFailedStatuses(): Promise<Result<void>> {
        this.options.logger.info('Starting retry process for registered folders with failed statuses');

        const failedFoldersResult = await this.fetchFailedRegisteredFolders();
        if (failedFoldersResult.isFail()) {
            this.options.logger.error('Failed to fetch failed registered folders.');
            return Result.fail();
        }

        const failedFolders = failedFoldersResult.value();
        if (isEmpty(failedFolders)) {
            this.options.logger.info('No failed registered folders found for retry.');
            return Result.Ok();
        }

        // Add the failed folders to the subject to batch process them
        this.folderRetrySubject.next(failedFolders);

        return Result.Ok();
    }

    private async fetchFailedRegisteredFolders(): Promise<Result<RegisteredFolder[]>> {
        return RetryUtils.retry(
            () => this.options.registeredFolderRepositoryInterface.getRegisteredFoldersWithFailedStatuses(),
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
        this.options.logger.info(`Retrying a batch of ${failedFolders.length} failed folders.`);

        const succeededRegisteredFolders: RegisteredFolder[] = [];
        const failedRegisteredFolders: RegisteredFolder[] = [];
        const removeRegisteredFolders: RegisteredFolder[] = [];

        // Process all folders and collect results
        const results = await Promise.all(
            failedFolders.map((folder) => this.retryFolder(folder).then((result) => ({ folder, result }))),
        );

        // Split results into success, failures, and folders to remove

        results.forEach(({ folder, result }) => {
            if (result.isOk()) {
                succeededRegisteredFolders.push(folder);
            } else if (result.error().includes('not-found')) {
                removeRegisteredFolders.push(folder);
            } else {
                failedRegisteredFolders.push(folder);
            }
        });

        // Handle successes
        if (!isEmpty(succeededRegisteredFolders)) {
            this.options.logger.info(`Successfully retried ${succeededRegisteredFolders.length} folders.`);
            this.options.registeredFolderRepositoryInterface.upsertRegisteredFolders(succeededRegisteredFolders);
        }

        // Handle removals
        if (!isEmpty(removeRegisteredFolders)) {
            const removeRegisterFoldersIds = removeRegisteredFolders.map(
                (foldersIds) => foldersIds.getProps().folderId,
            );
            this.options.logger.info(`Removing ${removeRegisteredFolders.length} folders from the database.`);
            await this.deleteRegisterFoldersFromRepository(removeRegisterFoldersIds);
        }

        // Handle failures
        if (!isEmpty(failedRegisteredFolders)) {
            this.options.logger.error(`Failed to retry ${failedRegisteredFolders.length} folders.`);
            failedRegisteredFolders.forEach((folder) => {
                this.options.logger.error(`Folder ID: ${folder.getProps().folderId} failed with error.`);
            });

            // Optionally re-queue failed folders for a later retry
            this.folderRetrySubject.next(failedRegisteredFolders);
        }

        // Return combined result
        if (!isEmpty(failedRegisteredFolders)) {
            return Result.fail(`Failed to retry some folders in batch.`);
        }

        return Result.Ok();
    }

    private async retryFolder(folder: RegisteredFolder): Promise<Result<void>> {
        const folderProps = folder.getProps();
        const { folderId, status, password } = folderProps;

        this.options.logger.info(`Retrying operation for folder ID: ${folderId} with status: ${status}`);

        let retryFetchResult: Result<Folder>;
        retryFetchResult = await RetryUtils.retry(
            () => this.options.romachEntitiesApi.fetchFolderByIdAndPassword({ folderId, password }),
            this.options.maxRetry,
            this.options.logger,
        );

        if (retryFetchResult.isFail()) {
            const error = retryFetchResult.error();
            if (error && error.includes('not found')) {
                this.options.logger.info(`Folder ID: ${folderId} not found. Marking for removal.`);
                Result.fail({ reason: 'not found', folderId });
            }

            this.options.logger.error(`Failed to retry operation for folder ID: ${folderId}`);
            return Result.fail(`Failed to retry operation for folder ID: ${folderId}`);
        }

        this.options.logger.info(`Successfully retried operation for folder ID: ${folderId}`);
        return Result.Ok();
    }

    private async deleteRegisterFoldersFromRepository(folders: string[]): Promise<void> {
        try {
            await this.options.registeredFolderRepositoryInterface.deleteRegisteredFoldersByIds(folders);
            this.options.logger.info(`Successfully removed folders ID: ${folders} from the database.`);
        } catch (error) {
            this.options.logger.error(`Failed to remove folder ID: ${folders} from the database. Error: ${error}`);
        }
    }
}
