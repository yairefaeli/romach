// FoldersService.ts
import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { BasicFolderChange } from "./basic-folder-change-detection.service";
import { RefetchFoldersService } from "../use-cases/refetch-folders/refetch-folders.use-case.service";
import { Result } from "rich-domain";

export class FoldersService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly refetchFoldersService: RefetchFoldersService
    ) { }

    // Execute method to handle folder changes
    async execute(change: BasicFolderChange): Promise<Result<void>> {
        this.logger.info('Executing folders service...');

        // Combine all folder IDs from added, updated, and deleted arrays
        const basicFolderUpdatedOrAdded = [
            ...change.inserted.map(folder => folder.getProps().id),
            ...change.updated.map(folder => folder.getProps().id),
        ];

        // Call refetchFoldersService to execute the refetch process
        await this.refetchFoldersService.execute(basicFolderUpdatedOrAdded, basicFolderDeleted);
    }
}
