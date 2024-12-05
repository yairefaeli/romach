import { UpdateBasicFoldersRepositoryService } from '../update-basic-folder-repository/update-basic-folders-repository.service';
import { BasicFolderChangeDetectionService } from '../basic-folder-change-detection/basic-folder-change-detection.service';
import { UpdateRegisteredFoldersService } from '../folders/update-registered-folders/update-registered-folders.service';
import { TreeCalculationHandlerService } from '../tree-calculation-handler/tree-calculation-handler.service';
import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { RetryUtils } from '../../../utils/RetryUtils/RetryUtils';
import { Result } from 'rich-domain';

export interface BasicFolderChangeHandlerServiceOptions {
    maxRetry: number;
    logger: AppLoggerService;
    treeCalculatorHandlerService: TreeCalculationHandlerService;
    updateRegisteredFoldersService: UpdateRegisteredFoldersService;
    basicFolderChangeDetectionService: BasicFolderChangeDetectionService;
    updateBasicFoldersRepositoryService: UpdateBasicFoldersRepositoryService;
}

export class BasicFolderChangeHandlerService {
    constructor(private options: BasicFolderChangeHandlerServiceOptions) {}

    async execute(folders: BasicFolder[]): Promise<Result> {
        const changesResult = await this.detectChanges(folders);

        if (changesResult.isFail()) {
            return Result.fail();
        }

        const changes = changesResult.value();

        const res = await Promise.all([
            this.foldersServiceChanges(changes),
            this.treeCalculatorServiceChanges(changes),
        ]);

        if (Result.combine(res).isFail()) {
            return Result.fail();
        }

        const saveResult = await this.options.updateBasicFoldersRepositoryService.execute(changes);

        if (saveResult.isFail()) {
            return Result.fail();
        }

        return Result.Ok();
    }

    private async detectChanges(folders: BasicFolder[]) {
        this.options.logger.debug(`Starting to detect change`);

        const detectChanges = await RetryUtils.retry(
            () => this.options.basicFolderChangeDetectionService.execute(folders),
            this.options.maxRetry,
            this.options.logger,
        );

        if (detectChanges.isFail()) {
            this.options.logger.error(`Error to detect changes: ${detectChanges.error()}`);
        } else {
            this.options.logger.debug(`Detect changes success: ${this.detectChanges.toString()}`);
        }

        return detectChanges;
    }

    private async treeCalculatorServiceChanges(change: BasicFolderChange) {
        this.options.logger.debug(`Starting to calculate tree`);
        const treeCalculatorChanges = await RetryUtils.retry(
            () => this.options.treeCalculatorService.execute(change),
            this.options.maxRetry,
            this.options.logger,
        );

        if (treeCalculatorChanges.isFail()) {
            this.options.logger.error(`Error to tree calculator changes: ${treeCalculatorChanges.error()}`);
        } else {
            this.options.logger.debug(`Tree calculator changes success: ${this.detectChanges.toString()}`);
        }

        return treeCalculatorChanges;
    }

    private async foldersServiceChanges(change: BasicFolderChange) {
        this.options.logger.debug(`starting to refetch folders`);

        const folderChanges = await RetryUtils.retry(
            () => this.options.updateRegisteredFoldersService.handleBasicFoldersChange(change),
            this.options.maxRetry,
            this.options.logger,
        );

        if (folderChanges.isFail()) {
            this.options.logger.error(`Error to calc folder changes: ${folderChanges.error()}`);
        } else {
            this.options.logger.debug(`Detect changes success: ${this.detectChanges.toString()}`);
        }

        return folderChanges;
    }
}
