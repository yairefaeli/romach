import { isNil } from "lodash";
import { Result } from "rich-domain";
import { BasicFolderChange } from "src/application/interfaces/basic-folder-changes.interface";
import { BasicFolder } from "src/domain/entities/BasicFolder";
import { Hierarchy } from "src/domain/entities/Hierarchy";
import { Tree } from "src/domain/entities/Tree";
import { TreeCalculationHandlerServiceOptions, TreeCalculationHandlerService } from "./tree-calculation-handler.service";

export class TreeCalculationHandlerServiceDriver {
    private mockOptions: jest.Mocked<TreeCalculationHandlerServiceOptions> = {
        // @ts-ignore
        basicFolderRepositoryInterface: { getBasicFolders: jest.fn() },
        // @ts-ignore
        hierarchiesRepositoryInterface: { saveHierarchies: jest.fn(), getHierarchies: jest.fn() },
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
        repositoryFolders: (basicFolders: BasicFolder[] | null): this => {
            (
                this.mockOptions.basicFolderRepositoryInterface.getBasicFolders as jest.Mock<ReturnType<
                    typeof this.mockOptions.basicFolderRepositoryInterface.getBasicFolders
                >>
            ).mockReturnValue(
                Promise.resolve(!isNil(basicFolders) ? Result.Ok(basicFolders) : Result.fail('No folders found')),
            );
            return this;
        },

        repositoryHierarchies: (hierarchies: Hierarchy[] | null): this => {
            (
                this.mockOptions.hierarchiesRepositoryInterface.getHierarchies as jest.Mock
            ).mockReturnValue(
                Promise.resolve(
                    isNil(hierarchies) ? Result.fail('No hierarchies found') : Result.Ok(hierarchies),
                ),
            );
            return this;
        },

        calculateTree: (treeResult: Result<Tree>): this => {
            (this.mockOptions.treeCalculationService.calculateTree as jest.Mock).mockReturnValue(Promise.resolve(treeResult));
            return this;
        },

        loggerBehavior: (infoMessages: string[], errorMessages: string[]): this => {
            (
                this.mockOptions.logger.info as jest.Mock).mockImplementation((msg) => {
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
        execute: async (changes: BasicFolderChange) => {
            return this.treeCalculationHandlerService.execute(changes);
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
