import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { RetryUtils } from 'src/utils/RetryUtils/RetryUtils';
import { Result } from 'rich-domain';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entities-api.interface';
import { Subject, timer } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Folder } from 'src/domain/entities/Folder';

export interface RetryFailedStatusServiceOptions {
    logger: AppLoggerService,
    repository: RomachRepositoryInterface,
    maxRetry: number,
    retryInterval: number,
    romachEntitiesApi: RomachEntitiesApiInterface,
}

export class RetryFailedStatusService {
    private folderRetrySubject = new Subject<RegisteredFolder[]>();

    constructor(private options: RetryFailedStatusServiceOptions) {
        // Set interval for retry process every 10 minutes (600,000 ms)
        setInterval(() => this.retryFailedStatuses(), this.options.retryInterval);

        // Listen to the retry requests and process them in batches using debounce
        this.folderRetrySubject.pipe(
            debounceTime(10000), // Wait for 10 seconds before processing the batch
            switchMap(async (failedFolders: RegisteredFolder[]) => {
                return await this.retryFoldersInBatch(failedFolders);
            })
        ).subscribe({
            next: (result) => {
                if (result.isFail()) {
                    this.options.logger.error('Batch retry for folders failed.');
                } else {
                    this.options.logger.info('Batch retry for folders succeeded.');
                }
            },
            error: (err) => {
                this.options.logger.error(`Error during batch retry: ${err}`);
            }
        });
    }

    private async retryFailedStatuses(): Promise<Result<void>> {
        this.options.logger.info('Starting retry process for registered folders with failed statuses');

        const failedFoldersResult = await this.fetchFailedRegisteredFolders();
        if (failedFoldersResult.isFail()) {
            this.options.logger.error('Failed to fetch failed registered folders.');
            return Result.fail();
        }

        const failedFolders = failedFoldersResult.value();
        if (failedFolders.length === 0) {
            this.options.logger.info('No failed registered folders found for retry.');
            return Result.Ok();
        }

        // Add the failed folders to the subject to batch process them
        this.folderRetrySubject.next(failedFolders);

        return Result.Ok();
    }

    private async fetchFailedRegisteredFolders(): Promise<Result<RegisteredFolder[]>> {
        return RetryUtils.retry(
            () => this.options.repository.getRegisteredFoldersWithFailedStatuses(),
            this.options.maxRetry,
            this.options.logger
        ).then(result => {
            if (result.isFail()) {
                this.options.logger.error(`Failed to fetch registered folders with failed statuses: ${result.error()}`);
            }
            return result;
        });
    }

    private async retryFoldersInBatch(failedFolders: RegisteredFolder[]): Promise<Result<void>> {
        this.options.logger.info(`Retrying a batch of ${failedFolders.length} failed folders...`);

        const results = await Promise.all(failedFolders.map(folder => this.retryFolder(folder)));

        const failedResults = results.filter(result => result.isFail());

        if (failedResults.length > 0) {
            this.options.logger.error(`Failed to retry ${failedResults.length} folders in batch.`);
            return Result.fail('Failed to retry some folders in batch.');
        }

        this.options.logger.info(`Successfully retried all ${failedFolders.length} folders in batch.`);
        return Result.Ok();
    }

    private async retryFolder(folder: RegisteredFolder): Promise<Result<void>> {
        const folderProps = folder.getProps();
        const { folderId, status, password } = folderProps;

        this.options.logger.info(`Retrying operation for folder ID: ${folderId} with status: ${status}`);

        let retryFetchResult: Result<Folder>;
        retryFetchResult = await RetryUtils.retry(
            () => this.options.romachEntitiesApi.fetchFolderByIdWithPassword(folderId, password),
            this.options.maxRetry,
            this.options.logger
        );

        if (retryFetchResult.isFail()) {
            this.options.logger.error(`Failed to retry operation for folder ID: ${folderId}`);
            return Result.fail(`Failed to retry operation for folder ID: ${folderId}`);
        }

        this.options.logger.info(`Successfully retried operation for folder ID: ${folderId}`);
        return Result.Ok();
    }

}
