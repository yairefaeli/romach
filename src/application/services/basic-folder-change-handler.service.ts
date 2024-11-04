import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { BasicFolderChangeDetectionService } from "./basic-folder-change-detection.service";
import { UpdateBasicFoldersRepositoryService } from "./update-basic-folder-repository.service";
import { FoldersService } from "./folders.service";
import { TreeCalculationHandlerService } from "./tree-calculation-handler.service";
import { BasicFolder } from "src/domain/entities/BasicFolder";
import { Result } from "rich-domain";
import { RetryUtils } from "src/utils/RetryUtils/RetryUtils";
import { BasicFolderChange } from "../interfaces/basic-folder-changes.interface";

export interface BasicFolderChangeHandlerServiceOptions {
    logger: AppLoggerService;
    foldersService: FoldersService;
    maxRetry: number;
    updateBasicFoldersRepositoryService: UpdateBasicFoldersRepositoryService;
    treeCalculatorService: TreeCalculationHandlerService;
    basicFolderChangeDetectionService: BasicFolderChangeDetectionService;
}
export class BasicFolderChangeHandlerService {
    constructor(private options: BasicFolderChangeHandlerServiceOptions) { }

    async execute(folders: BasicFolder[]): Promise<Result<void>> {

        const changesResult = await this.detectChanges(folders);

        if (changesResult.isFail()) {
            return Result.fail();
        }

        const changes = changesResult.value();

        const res = await Promise.all([
            this.treeCalculatorServiceChanges(changes),
            this.foldersServiceChanges(changes),
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

    private async detectChanges(folders: BasicFolder[]) {
        this.options.logger.debug(
            `starting to detect change`
        )
        const detectChanges = await RetryUtils.retry(
            () =>
                this.options.basicFolderChangeDetectionService.execute(
                    folders,
                ),
            this.options.maxRetry,
            this.options.logger,
        );

        if (detectChanges.isFail()) {
            this.options.logger.error(
                `error to detect changes: ${detectChanges.error()}`,
            );
        } else {
            this.options.logger.debug(
                `detect changes succses: ${this.detectChanges.toString()}`,
            );
        }

        return detectChanges;
    }

    private async treeCalculatorServiceChanges(change: BasicFolderChange) {
        this.options.logger.debug(
            `starting to calculate tree`
        )
        const treeCalculatorChanges = await RetryUtils.retry(
            () =>
                this.options.treeCalculatorService.execute(
                    change
                ),
            this.options.maxRetry,
            this.options.logger,
        );

        if (treeCalculatorChanges.isFail()) {
            this.options.logger.error(
                `error to tree calculator Changes: ${treeCalculatorChanges.error()}`,
            );
        } else {
            this.options.logger.debug(
                `tree calculator changes succses: ${this.detectChanges.toString()}`,
            );
        }

        return treeCalculatorChanges;
    }

    private async foldersServiceChanges(change: BasicFolderChange) {
        this.options.logger.debug(
            `starting to reftech folders`
        )
        const folderChanges = await RetryUtils.retry(
            () =>
                this.options.foldersService.basicFolderUpdated(
                    change,
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
                `detect changes succses: ${this.detectChanges.toString()}`,
            );
        }

        return folderChanges;
    }

}
