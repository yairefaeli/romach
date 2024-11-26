import {
    TreeCalculationHandlerServiceOptions,
    TreeCalculationHandlerService,
} from './tree-calculation-handler.service';
import { TreeCalculationServiceTestkit } from '../../../domain/services/tree-calculation/tree-calculation.service.testkit';
import { HierarchiesRepositoryTestkit } from '../../interfaces/hierarchies-interface/hierarchies.interface.testkit';
import { BasicFoldersRepositoryTestkit } from '../../interfaces/basic-folder/basic-folders-repository.testkit';
import { HierarchiesRepositoryInterface } from '../../interfaces/hierarchies-interface/hierarchies.interface';
import { TreeCalculationService } from '../../../domain/services/tree-calculation/tree-calculation.service';
import { aBasicFolderChange } from '../../../utils/builders/BasicFolderChange/basic-folder-change.builder';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { aBasicFolder } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Hierarchy } from 'src/domain/entities/Hierarchy';
import { Tree } from 'src/domain/entities/Tree';
import { Result } from 'rich-domain';
import { isNil } from 'lodash';

export class TreeCalculationHandlerServiceDriver {
    private treeCalculationService = TreeCalculationServiceTestkit();
    private basicFolderInterfaceTestkit = BasicFoldersRepositoryTestkit();
    private hierarchiesRepositoryTestkit = HierarchiesRepositoryTestkit();
    private mockOptions: jest.Mocked<TreeCalculationHandlerServiceOptions> = {
        // @ts-ignore
        treeCalculationService: { calculateTree: jest.fn() },
        // @ts-ignore
        logger: {
            info: jest.fn() as jest.Mock,
            error: jest.fn() as jest.Mock,
            debug: jest.fn() as jest.Mock,
        },
        maxRetry: 3,
    };

    private treeCalculationHandlerService: TreeCalculationHandlerService;

    given = {
        repositoryFolders: (result: Result<BasicFolder[]>): this => {
            (this.mockOptions.basicFolderRepositoryInterface.getBasicFolders as jest.Mock).mockReturnValue(
                Promise.resolve(result),
            );

            return this;
        },
        loggerError: (error: jest.Mock): this => {
            this.mockOptions.logger.error = error;

            return this;
        },
        repositoryHierarchies: (result: Result<Hierarchy>): this => {
            (this.mockOptions.hierarchiesRepositoryInterface.getHierarchies as jest.Mock).mockReturnValue(
                Promise.resolve(result),
            );
            return this;
        },

        getHierarchies: (getHierarchies: jest.Mock) => {
            this.mockOptions.hierarchiesRepositoryInterface.getHierarchies = getHierarchies;
            return this;
        },

        calculateTree: (calculateTree: jest.Mock) => {
            this.mockOptions.treeCalculationService.calculateTree = calculateTree;
            return this;
        },

        loggerBehavior: (infoMessages: string[], errorMessages: string[]): this => {
            (this.mockOptions.logger.info as jest.Mock).mockImplementation((msg) => {
                if (!infoMessages.includes(msg)) {
                    throw new Error(`Unexpected info message: ${msg}`);
                }
            });
            (this.mockOptions.logger.error as jest.Mock).mockImplementation((msg) => {
                if (!errorMessages.includes(msg)) {
                    throw new Error(`Unexpected error message: ${msg}`);
                }
            });
            return this;
        },
    };

    when = {
        build: async (): Promise<this> => {
            this.treeCalculationHandlerService = new TreeCalculationHandlerService(this.mockOptions);
            return this;
        },
        execute: async (changes?: BasicFolderChange) => {
            return this.treeCalculationHandlerService.execute(changes || aBasicFolderChange());
        },
    };

    get = {
        treeCalculationHandlerService: (): TreeCalculationHandlerService => this.treeCalculationHandlerService,
        loggerInfoCalls: (): string[] =>
            (this.mockOptions.logger.info as jest.Mock).mock.calls.map((call) => call[0] as string),
        loggerErrorCalls: (): string[] =>
            (this.mockOptions.logger.error as jest.Mock).mock.calls.map((call) => call[0] as string),
    };
}
