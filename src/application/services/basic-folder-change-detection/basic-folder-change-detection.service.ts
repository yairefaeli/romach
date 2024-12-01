import { BasicFoldersRepositoryInterface } from 'src/application/interfaces/basic-folders-repository/basic-folders-repository.interface';
import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { RetryUtils } from '../../../utils/RetryUtils/RetryUtils';
import { keyBy, partition } from 'lodash';
import { Result } from 'rich-domain';

export interface BasicFolderChangeDetectionServiceOptions {
    basicFolderRepositoryInterface: BasicFoldersRepositoryInterface;
    logger: AppLoggerService;
    maxRetry: number;
}

export class BasicFolderChangeDetectionService {
    constructor(private readonly options: BasicFolderChangeDetectionServiceOptions) {}

    async execute(current: BasicFolder[]): Promise<Result<BasicFolderChange>> {
        const foldersIds = current.map((folder) => folder.getProps().id);

        const repositoryBasicFoldersIdsAndUpdatedAt = await this.getRepositoryBasicFoldersIdsAndsUpdatedAt(foldersIds);

        if (repositoryBasicFoldersIdsAndUpdatedAt.isFail()) {
            return Result.fail();
        }

        const previousFoldersIdsAndUpdatedAt = repositoryBasicFoldersIdsAndUpdatedAt.value();

        // Create a dictionary of previous folders keyed by ID
        const previousFoldersById = keyBy(previousFoldersIdsAndUpdatedAt, 'id');

        // Partition folders into deleted and upserted
        const [deleted, upserted] = partition(current, (folder) => folder.getProps().deleted);

        const deletedFoldersIds = deleted.map((folder) => folder.getProps().id);

        const [updated, inserted] = partition(
            upserted,
            (upsertedFolder) =>
                previousFoldersById[upsertedFolder.getProps().id] &&
                previousFoldersById[upsertedFolder.getProps().id].updatedAt !== upsertedFolder.getProps().updatedAt,
        );

        return Result.Ok({
            inserted,
            updated,
            deleted: deletedFoldersIds,
        });
    }

    private async getRepositoryBasicFoldersIdsAndsUpdatedAt(folderIds: string[]) {
        this.options.logger.debug(`starting to fetch basic folders ids and updated at`);
        const folderChanges = await RetryUtils.retry(
            () => this.options.basicFolderRepositoryInterface.getBasicFoldersIdsAndsUpdatedAt(folderIds),
            this.options.maxRetry,
            this.options.logger,
        );

        if (folderChanges.isFail()) {
            this.options.logger.error(`error to calc folder changes: ${folderChanges.error()}`);
        } else {
            this.options.logger.debug(`detect changes success: ${folderChanges.toString()}`);
        }

        return folderChanges;
    }
}
