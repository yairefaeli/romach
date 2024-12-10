import { BasicFoldersRepositoryInterface } from 'src/application/interfaces/basic-folders-repository/basic-folders-repository.interface';
import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { Result } from 'rich-domain';

interface UpdateBasicFolderRepositoryOptions {
    logger: AppLoggerService;
    basicFolderRepositoryInterface: BasicFoldersRepositoryInterface;
}

export class UpdateBasicFoldersRepositoryService {
    constructor(private readonly options: UpdateBasicFolderRepositoryOptions) {}

    async execute(changes: BasicFolderChange): Promise<Result> {
        const folders = [...changes.inserted, ...changes.updated];
        this.options.logger.info(`Upserting ${folders.length} folders`);
        const saveBasicFoldersResult = await this.options.basicFolderRepositoryInterface.saveBasicFolders(folders);

        if (saveBasicFoldersResult.isFail()) {
            this.options.logger.error(`Error saving basic folders: ${saveBasicFoldersResult.error()}`);

            return Result.fail(saveBasicFoldersResult.error());
        } else {
            this.options.logger.info(`Successfully saved ${folders.length} folders`);
        }

        const deleteBasicFolderResult = await this.options.basicFolderRepositoryInterface.deleteBasicFolderByIds(
            changes.deleted,
        );

        if (deleteBasicFolderResult.isFail()) {
            this.options.logger.error(`Error deleting basic folders: ${deleteBasicFolderResult.error()}`);

            return Result.fail(deleteBasicFolderResult.error());
        }

        this.options.logger.info(`Successfully deleted ${changes.deleted.length} folders`);

        return Result.Ok();
    }
}
