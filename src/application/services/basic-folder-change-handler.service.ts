import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { BasicFolderChangeDetectionService } from "./basic-folder-change-detection.service";
import { UpdateBasicFoldersRepositoryService } from "./update-basic-folder-repository.service";
import { FoldersService } from "./folders.service";
import { TreeCalculationHandlerService } from "./tree-calculation-handler.service";
import { BasicFolder } from "src/domain/entities/BasicFolder";
import { Result } from "rich-domain";

export interface BasicFolderChangeHandlerServiceOptions {

    logger: AppLoggerService,
    foldersService: FoldersService,
    updateBasicFoldersRepositoryService: UpdateBasicFoldersRepositoryService,
    treeCalculatorService: TreeCalculationHandlerService,
    basicFolderChangeDetectionService: BasicFolderChangeDetectionService
}
export class BasicFolderChangeHandlerService {
    constructor(private options: BasicFolderChangeHandlerServiceOptions
    ) { }

    async execute(folders: BasicFolder[]): Promise<Result<void>> {

        const changesResult = await this.options.basicFolderChangeDetectionService.execute(folders);

        if (changesResult.isFail()) {
            this.options.logger.error(
                `error calculate change detection service: ${changesResult.error()}`,
            );
            return Result.fail();
        }

        const changes = changesResult.value();

        const res = await Promise.all([
            this.options.foldersService.execute(changes),
            this.options.treeCalculatorService.execute(changes),
        ]);

        if (Result.combine(res).isFail()) {
            return Result.fail()
        }

        const saveResult = await this.options.updateBasicFoldersRepositoryService.execute(changes);

        if (saveResult.isFail()) {
            return Result.fail()
        }

        return Result.Ok()

    }
}
