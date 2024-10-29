import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { BasicFolderChange } from "./basic-folder-change-detection.service";
import { Result } from "rich-domain";

export class TreeCalculationHandlerService {
    constructor(
        private readonly logger: AppLoggerService,
    ) { }

    async execute(folderChangeDetectionResult: BasicFolderChange): Promise<Result<void>> {
        // Step 3: Recalculate the tree
        this.logger.info('Recalculating tree...');
        // Recalculate the tree
        // ...
        this.logger.info('Tree recalculation completed.');

    }
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
}