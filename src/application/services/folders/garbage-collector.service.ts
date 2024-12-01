import { RegisteredFolderRepositoryInterface } from 'src/application/interfaces/regsitered-folder-interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { RetryUtils } from 'src/utils/RetryUtils/RetryUtils';
import { Result } from 'rich-domain';
import { isEmpty } from 'lodash';

export interface GarbageCollectorServiceOptions {
    logger: AppLoggerService;
    registeredFolderRepositoryInterface: RegisteredFolderRepositoryInterface;
    maxRetry: number;
    gcInterval: number;
}

export class GarbageCollectorService {
    constructor(private options: GarbageCollectorServiceOptions) {
        setInterval(() => this.performGarbageCollection(), this.options.gcInterval);
    }

    private async performGarbageCollection(): Promise<Result> {
        this.options.logger.info('Starting garbage collection for registered folders...');

        // Query the database to get registered folders matching the conditions
        const expiredFoldersResult = await this.fetchExpiredFolders();
        if (expiredFoldersResult.isFail()) {
            return Result.fail('Failed to fetch expired registered folders');
        }

        const expiredFolders = expiredFoldersResult.value();

        if (isEmpty(expiredFolders)) {
            this.options.logger.info('No registered folders found for deletion.');
            return Result.Ok();
        }

        // Get the folder IDs to be deleted
        const folderIdsToDelete = expiredFolders.map((folder) => folder.getProps().folderId);

        return this.deleteExpiredFolders(folderIdsToDelete);
    }

    private async fetchExpiredFolders(): Promise<Result<RegisteredFolder[]>> {
        return RetryUtils.retry(
            () => this.options.registeredFolderRepositoryInterface.getExpiredRegisteredFolders(),
            this.options.maxRetry,
            this.options.logger,
        ).then((result) => {
            if (result.isFail()) {
                this.options.logger.error(`Failed to fetch expired registered folders: ${result.error()}`);
            }
            return result;
        });
    }

    private async deleteExpiredFolders(folderIdsToDelete: string[]): Promise<Result<void>> {
        const deleteResult = await RetryUtils.retry(
            () => this.options.registeredFolderRepositoryInterface.deleteRegisteredFoldersByIds(folderIdsToDelete),
            this.options.maxRetry,
            this.options.logger,
        );

        if (deleteResult.isFail()) {
            this.options.logger.error(`Failed to delete expired registered folders: ${deleteResult.error()}`);
            return Result.fail('Failed to delete expired registered folders');
        }

        this.options.logger.info(`Deleted ${folderIdsToDelete.length} expired registered folders.`);
        return Result.Ok();
    }
}
