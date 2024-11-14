import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { isEmpty } from 'lodash';
import { RetryUtils } from 'src/utils/RetryUtils/RetryUtils';
import { Result } from 'rich-domain';

export interface GarbageCollectorServiceOptions {
    logger: AppLoggerService,
    repository: RomachRepositoryInterface,
    maxRetry: number,
    gcInterval: number,
}

export class GarbageCollectorService {
    constructor(private options: GarbageCollectorServiceOptions
    ) {
        setInterval(() => this.performGarbageCollection(), this.options.gcInterval);

    }

    private async performGarbageCollection(): Promise<Result<void>> {
        this.options.logger.info('Starting garbage collection for registered folders...');

        const currentTimestamp = Timestamp.now();

        // Define the thresholds
        const registrationThreshold = currentTimestamp.subtractSeconds(60).toString(); // numbers - get from config
        const validPasswordThreshold = currentTimestamp.subtractHours(24).toString();

        // Query the database to get registered folders matching the conditions
        const expiredFoldersResult = await RetryUtils.retry(
            () => this.options.repository.getExpiredRegisteredFolders(registrationThreshold, validPasswordThreshold),
            this.options.maxRetry,
            this.options.logger
        );

        if (expiredFoldersResult.isFail()) {
            this.options.logger.error(`Failed to fetch expired registered folders: ${expiredFoldersResult.error()}`);
            return Result.fail('Failed to fetch expired registered folders');
        }

        const expiredFolders = expiredFoldersResult.value();

        if (isEmpty(expiredFolders)) {
            this.options.logger.info('No registered folders found for deletion.');
            return Result.Ok();
        }

        // Get the folder IDs to be deleted
        const folderIdsToDelete = expiredFolders.map(folder => folder.getProps().folderId);

        return this.deleteExpiredFolders(folderIdsToDelete);
    }

    private async deleteExpiredFolders(folderIdsToDelete: string[]): Promise<Result<void>> {
        const deleteResult = await RetryUtils.retry(
            () => this.options.repository.deleteregisteredFoldersByIds(folderIdsToDelete),
            this.options.maxRetry,
            this.options.logger
        );

        if (deleteResult.isFail()) {
            this.options.logger.error(`Failed to delete expired registered folders: ${deleteResult.error()}`);
            return Result.fail('Failed to delete expired registered folders');
        }

        this.options.logger.info(`Deleted ${folderIdsToDelete.length} expired registered folders.`);
        return Result.Ok();
    }
}
