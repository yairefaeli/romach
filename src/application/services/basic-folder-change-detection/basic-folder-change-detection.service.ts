import { BasicFoldersRepositoryInterface } from 'src/application/interfaces/basic-folders-repository/basic-folders-repository.interface';
import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { RetryUtils } from 'src/utils/RetryUtils/RetryUtils';
import { differenceBy } from 'lodash';
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

        const previousFoldersResult = await this.getBasicFoldersIdsAndsUpdatedAt(foldersIds);

        if (previousFoldersResult.isFail()) {
            return Result.fail();
        }

        const previousFoldersIdsAndUpdatedAt = previousFoldersResult.value();

        const deleted = current.filter((folder) => folder.getProps().deleted).map((folder) => folder.getProps().id);

        const updated = differenceBy(
            current.map((folder) => ({ ...folder, key: `${folder.getProps().id}-${folder.getProps().updatedAt}` })),
            previousFoldersIdsAndUpdatedAt.map((folder) => ({ ...folder, key: `${folder.id}-${folder.updatedAt}` })),
            'key',
        );

        const inserted = differenceBy(current, [...deleted, ...updated], 'id');

        return Result.Ok({
            inserted,
            deleted,
            updated,
        });
    }

    private async getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]) {
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
