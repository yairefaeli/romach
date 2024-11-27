import { RomachEntitiesApiInterfaceTestkit } from '../../interfaces/romach-entites-api/romach-entities-api.interface.testkit';
import { TreeCalculationServiceTestkit } from '../../../domain/services/tree-calculation/tree-calculation.service.testkit';
import { HierarchiesRepositoryTestkit } from '../../interfaces/hierarchies-interface/hierarchies.interface.testkit';
import { BasicFoldersRepositoryTestkit } from '../../interfaces/basic-folder/basic-folders-repository.testkit';
import { aBasicFolderChange } from '../../../utils/builders/BasicFolderChange/basic-folder-change.builder';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { AppLoggerServiceTestkit } from '../../../infra/logging/app-logger.service.testkit';
import { TreeCalculationHandlerService } from './tree-calculation-handler.service';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Hierarchy } from 'src/domain/entities/Hierarchy';
import { chance } from '../../../utils/Chance/chance';
import { Result } from 'rich-domain';

export class TreeCalculationHandlerServiceDriver {
    private loggerTestkit = AppLoggerServiceTestkit();
    private maxRetry = chance.integer({ min: 1, max: 5 });
    private hierarchiesRepositoryTestkit = HierarchiesRepositoryTestkit();
    private basicFolderRepositoryTestkit = BasicFoldersRepositoryTestkit();
    private treeCalculationServiceTestkit = TreeCalculationServiceTestkit();

    private treeCalculationHandlerService: TreeCalculationHandlerService;

    given = {
        repositoryFolders: (result: Result<BasicFolder[]>): this => {
            this.basicFolderRepositoryTestkit.mockGetBasicFolders(result);
            return this;
        },
        repositoryHierarchies: (result: Result<Hierarchy[]>): this => {
            this.hierarchiesRepositoryTestkit.mockGetHierarchies(result);
            return this;
        },
    };

    when = {
        init: async (): Promise<this> => {
            this.treeCalculationHandlerService = new TreeCalculationHandlerService({
                maxRetry: this.maxRetry,
                logger: this.get.logger(),
                treeCalculationService: this.get.treeCalculationService(),
                hierarchiesRepositoryInterface: this.get.hierarchiesRepository(),
                basicFolderRepositoryInterface: this.get.basicFolderRepository(),
            });
            return this;
        },
        execute: async (changes?: BasicFolderChange) => {
            return this.treeCalculationHandlerService.execute(changes || aBasicFolderChange());
        },
    };


    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
        treeCalculationService: () => this.treeCalculationServiceTestkit.treeCalculationService(),
        hierarchiesRepository: () => this.hierarchiesRepositoryTestkit.hierarchiesRepository(),
        basicFolderRepository: () => this.basicFolderRepositoryTestkit.basicFoldersRepository(),
    };
}
