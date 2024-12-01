import { UpdateBasicFolderRepositoryServiceTestkit } from '../update-basic-folder-repository/update-basic-folder-repository.testkit.service';
import { BasicFolderChangeDetectionServiceTestkit } from '../basic-folder-change-detection/basic-folder-change-detection.service.testkit';
import { UpdateRegisteredFoldersServiceTestkit } from '../folders/update-registered-folders/update-registered-folders.service.testkit';
import { TreeCalculationHandlerServiceTestkit } from '../tree-calculation-handler/tree-calculation-handler.service.testkit';
import { AppLoggerServiceTestkit } from '../../../infra/logging/app-logger.service.testkit';
import { BasicFolderChangeHandlerService } from './basic-folder-change-handler.service';
import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { chance } from '../../../utils/Chance/chance';
import { Result } from 'rich-domain';

export class BasicFolderChangeHandlerServiceDriver {
    private maxRetry = chance.integer({ min: 1, max: 5 });
    private loggerTestkit = AppLoggerServiceTestkit();
    private basicFolderChangeHandlerService: BasicFolderChangeHandlerService;
    private treeCalculationHandlerTestkit = TreeCalculationHandlerServiceTestkit();
    private updateRegisteredFoldersServiceTestkit = UpdateRegisteredFoldersServiceTestkit();
    private basicFolderChangeDetectionServiceTestkit = BasicFolderChangeDetectionServiceTestkit();
    private updateBasicFolderRepositoryServiceTestkit = UpdateBasicFolderRepositoryServiceTestkit();

    constructor() {
        this.basicFolderChangeHandlerService = new BasicFolderChangeHandlerService({
            maxRetry: this.maxRetry,
            logger: this.get.logger(),
            treeCalculatorService: this.get.treeCalculationHandlerService(),
            updateRegisteredFoldersService: this.get.updateRegisteredFoldersService(),
            basicFolderChangeDetectionService: this.get.basicFolderChangeDetectionService(),
            updateBasicFoldersRepositoryService: this.get.updateBasicFoldersRepositoryService(),
        });
    }

    given = {
        executeTreeCalculation: (result: Result): this => {
            this.treeCalculationHandlerTestkit.mockExecute(result);
            return this;
        },
        detectChanges: (result: Result<BasicFolderChange>): this => {
            this.basicFolderChangeDetectionServiceTestkit.mockExecute(result);
            return this;
        },
        updateBasicFoldersRepository: (result: Result): this => {
            this.updateBasicFolderRepositoryServiceTestkit.mockExecute(result);
            return this;
        },
        mockHandleBasicFoldersChange: (result: Result): this => {
            this.updateRegisteredFoldersServiceTestkit.mockHandleBasicFoldersChange(result);
            return this;
        },
    };

    when = {
        init: (): this => {
            this.basicFolderChangeHandlerService = new BasicFolderChangeHandlerService({
                maxRetry: this.maxRetry,
                logger: this.get.logger(),
                treeCalculatorService: this.get.treeCalculationHandlerService(),
                updateRegisteredFoldersService: this.get.updateRegisteredFoldersService(),
                basicFolderChangeDetectionService: this.get.basicFolderChangeDetectionService(),
                updateBasicFoldersRepositoryService: this.get.updateBasicFoldersRepositoryService(),
            });

            return this;
        },
        execute: (folders: BasicFolder[]) => this.basicFolderChangeHandlerService.execute(folders),
    };

    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
        updateRegisteredFoldersService: () =>
            this.updateRegisteredFoldersServiceTestkit.updateRegisteredFoldersService(),
        basicFolderChangeDetectionService: () =>
            this.basicFolderChangeDetectionServiceTestkit.basicFolderChangeDetectionService(),
        updateBasicFoldersRepositoryService: () =>
            this.updateBasicFolderRepositoryServiceTestkit.basicFolderChangeDetectionService(),
        treeCalculationHandlerService: () => this.treeCalculationHandlerTestkit.treeCalculationHandlerService(),
    };
}
