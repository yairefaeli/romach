// import { Result } from 'rich-domain';
// import { BasicFolder } from '../../../domain/entities/BasicFolder';
// import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
// import { AppLoggerServiceTestkit } from '../../../infra/logging/app-logger.service.testkit';
// import { BasicFolderChangeHandlerService } from './basic-folder-change-handler.service';
// import { chance } from '../../../utils/Chance/chance';

// export class BasicFolderChangeHandlerServiceDriver {
//     private loggerTestkit = AppLoggerServiceTestkit();
//     private maxRetry = chance.integer({ min: 1, max: 5 });
//     private updateRegisteredFoldersServiceTestkit = UpdateRegisteredFoldersServiceTestkit();
//     private treeCalculationHandlerServiceTestkit = TreeCalculationHandlerServiceTestkit();
//     private basicFolderChangeDetectionServiceTestkit = BasicFolderChangeDetectionServiceTestkit();
//     private updateBasicFoldersRepositoryServiceTestkit = UpdateBasicFoldersRepositoryServiceTestkit();

//     private basicFolderChangeHandlerService: BasicFolderChangeHandlerService;

//     given = {
//         detectChanges: (result: Result<BasicFolderChange>): this => {
//             this.basicFolderChangeDetectionServiceTestkit.mockExecute(result);
//             return this;
//         },

//         treeCalculationService: (result: Result<void>): this => {
//             this.treeCalculationHandlerServiceTestkit.mockExecute(result);
//             return this;
//         },
//         folderChangesService: (result: Result<void>): this => {
//             this.updateRegisteredFoldersServiceTestkit.mockBasicFolderUpdated(result);
//             return this;
//         },
//         repositorySave: (result: Result<void>): this => {
//             this.updateBasicFoldersRepositoryServiceTestkit.mockExecute(result);
//             return this;
//         },
//     };

//     when = {
//         init: async (): Promise<this> => {
//             this.basicFolderChangeHandlerService = new BasicFolderChangeHandlerService({
//                 maxRetry: this.maxRetry,
//                 logger: this.get.logger(),
//                 updateRegisteredFoldersService: this.get.updateRegisteredFoldersService(),
//                 treeCalculatorService: this.get.treeCalculationHandlerService(),
//                 basicFolderChangeDetectionService: this.get.basicFolderChangeDetectionService(),
//                 updateBasicFoldersRepositoryService: this.get.updateBasicFoldersRepositoryService(),
//             });
//             return this;
//         },
//         execute: async (folders?: BasicFolder[]) => {
//             return this.basicFolderChangeHandlerService.execute(folders || []);
//         },
//     };

//     get = {
//         logger: () => this.loggerTestkit.appLoggerService(),
//         treeCalculationHandlerService: () => this.treeCalculationHandlerServiceTestkit.treeCalculationService(),
//         basicFolderChangeDetectionService: () =>
//             this.basicFolderChangeDetectionServiceTestkit.basicFolderChangeDetectionService(),
//         updateRegisteredFoldersService: () => this.updateRegisteredFoldersServiceTestkit.updateRegisteredFoldersService(),
//         updateBasicFoldersRepositoryService: () =>
//             this.updateBasicFoldersRepositoryServiceTestkit.updateBasicFoldersRepositoryService(),
//     };
// }

