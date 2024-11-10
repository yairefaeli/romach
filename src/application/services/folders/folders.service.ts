import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { Result } from "rich-domain";
import { BasicFolderChange } from "src/application/interfaces/basic-folder-changes.interface";

export class FoldersService {
    constructor(
        private readonly logger: AppLoggerService,
    ) { }

    async execute(change: BasicFolderChange): Promise<Result<void>> {
        return Result.Ok()

    }
}
