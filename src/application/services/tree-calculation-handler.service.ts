import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { Result } from "rich-domain";
import { BasicFolderChange } from "../interfaces/basic-folder-changes.interface";

export class TreeCalculationHandlerService {
    constructor(
        private readonly logger: AppLoggerService,
    ) { }

    async execute(changes: BasicFolderChange): Promise<Result<void>> {
        /* 
        replicate basic folders by timestamp
        compare (deep equal) every changed folder with the current folder in the database
        if the folder is not in the database, add it to changed folders
        if there are changed folders,
            add them to the database
            recalculate tree
        else
            do nothing        
    */

        return Result.Ok()
    }
}