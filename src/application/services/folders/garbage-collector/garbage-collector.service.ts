import { RegisteredFolderRepositoryInterface } from '../../../interfaces/registered-folders-repository/registered-folder-repository.interface';
import { AppLoggerService } from '../../../../infra/logging/app-logger.service';
import { RegisteredFolder } from '../../../../domain/entities/RegisteredFolder';
import { RetryUtils } from '../../../../utils/RetryUtils/RetryUtils';
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
        void this.performGarbageCollection();
    }

    private async performGarbageCollection(): Promise<void> {
        this.options.logger.info('Starting garbage collection for registered folders...');

        // Query the database to get registered folders matching the conditions
        const expiredFoldersResult = await this.fetchExpiredFolders();

        if (expiredFoldersResult.isFail()) {
            this.options.logger.error('Failed to fetch expired registered folders');
        } else {
            const expiredFolders = expiredFoldersResult.value();

            if (isEmpty(expiredFolders)) {
                this.options.logger.info('No registered folders found for deletion');
            }

            // Get the folder IDs to be deleted
            const folderIdsToDelete = expiredFolders.map((folder) => folder.getProps().folderId);

            await this.deleteExpiredFolders(folderIdsToDelete);
        }

        setTimeout(this.performGarbageCollection, this.options.gcInterval);
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

    private async deleteExpiredFolders(folderIdsToDelete: string[]): Promise<void> {
        const deleteResult = await RetryUtils.retry(
            () => this.options.registeredFolderRepositoryInterface.deleteRegisteredFoldersByIds(folderIdsToDelete),
            this.options.maxRetry,
            this.options.logger,
        );

        if (deleteResult.isFail()) {
            this.options.logger.error(`Failed to delete expired registered folders: ${deleteResult.error()}`);
        }

        this.options.logger.info(`Deleted ${folderIdsToDelete.length} expired registered folders`);
    }
}
