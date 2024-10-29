import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { RomachRepositoryInterface } from "../interfaces/romach-repository.interface";
import { BasicFolderChange } from "./basic-folder-change-detection.service";
import { Result } from "rich-domain";

export class UpdateBasicFoldersRepositoryService {
    constructor(
        private readonly repository: RomachRepositoryInterface,
        private readonly logger: AppLoggerService
    ) { }

    async execute(changes: BasicFolderChange): Promise<Result<void>> {
        const folders = [...changes.inserted, ...changes.updated];
        this.logger.info(`Upserting ${folders.length} folders`);
        const saveBasicFoldersResult = await this.repository.saveBasicFolders(folders);

        if (saveBasicFoldersResult.isFail()) {
            this.logger.error(`Error saving basic folders: ${saveBasicFoldersResult.error()}`);
            return Result.fail(saveBasicFoldersResult.error());
        } else {
            this.logger.info(`Successfully saved ${folders.length} folders`);
        }

        const deleteBasicFolderResult = await this.repository.deleteBasicFolderByIds(changes.deleted);

        if (deleteBasicFolderResult.isFail()) {
            this.logger.error(`Error deleting basic folders: ${deleteBasicFolderResult.error()}`);
            return Result.fail(deleteBasicFolderResult.error());

        }
        this.logger.info(`Successfully deleted ${changes.deleted.length} folders`);
        return Result.Ok();
    }
}