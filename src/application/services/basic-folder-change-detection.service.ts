import { RomachRepositoryInterface } from '../interfaces/romach-repository.interface';
import { AppLoggerService } from '../../infra/logging/app-logger.service';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Result } from 'rich-domain';
import { differenceBy } from 'lodash';
import { BasicFolderChange } from '../interfaces/basic-folder-changes.interface';
import { RetryUtils } from 'src/utils/RetryUtils/RetryUtils';

export interface BasicFolderChangeDetectionServiceOptions {
    repository: RomachRepositoryInterface;
    logger: AppLoggerService;
    pollInterval: number;
    retryInterval: number;
    maxRetry: number;
}

export class BasicFolderChangeDetectionService {
    constructor(
        private readonly repository: RomachRepositoryInterface,
        private readonly logger: AppLoggerService,
        private readonly options: BasicFolderChangeDetectionServiceOptions
    ) { }

    // Execute method to detect changes in fetched folders
    async execute(current: BasicFolder[]): Promise<Result<BasicFolderChange>> {

        const foldersIds = current.map(folder => folder.getProps().id)

        const previousFoldersResult = await this.foldersServiceChanges(foldersIds);

        if (previousFoldersResult.isFail()) {
            return Result.fail()
        }

        const previousFoldersIdsAndUpdatedAt = previousFoldersResult.value();

        const deleted = current.filter(folder => folder.getProps().deleted).map(folder => folder.getProps().id);

        const updated = differenceBy(current, previousFoldersIdsAndUpdatedAt, 'id', 'updatedAt');

        const inserted = differenceBy(current, [...deleted, ...updated], 'id');



        return Result.Ok({
            inserted,
            deleted,
            updated
        })

    }


    private async foldersServiceChanges(folderIds: string[]) {
        const folderChanges = await RetryUtils.retry(
            () =>
                this.repository.getBasicFoldersIdsAndsUpdatedAt(
                    folderIds,
                ),
            this.options.maxRetry,
            this.options.logger,
        );

        if (folderChanges.isFail()) {
            this.options.logger.error(
                `error to calc folder changes: ${folderChanges.error()}`,
            );
        } else {
            this.options.logger.debug(
                `detect changes succses: ${folderChanges.toString()}`,
            );
        }

        return folderChanges;
    }

}
