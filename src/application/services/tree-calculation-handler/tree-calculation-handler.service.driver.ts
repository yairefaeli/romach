import {
    TreeCalculationHandlerService,
    TreeCalculationHandlerServiceOptions,
} from './tree-calculation-handler.service';
import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Result } from 'rich-domain';
import { isNil } from 'lodash';

export class TreeCalculationHandlerServiceDriver {
    private mockOptions: jest.Mocked<TreeCalculationHandlerServiceOptions> = {
        // @ts-ignore
        basicFolderRepositoryInterface: { getBasicFolders: jest.fn() },
        // @ts-ignore
        logger: {
            error: jest.fn(),
        },
    };

    private treeCalculationHandlerService: TreeCalculationHandlerService;

    given = {
        repositoryFolders: (basicFolders: BasicFolder[] | null): this => {
            (
                this.mockOptions.basicFolderRepositoryInterface.getBasicFolders as jest.Mock<
                    ReturnType<typeof this.mockOptions.basicFolderRepositoryInterface.getBasicFolders>
                >
            ).mockReturnValue(Promise.resolve(isNil(basicFolders) ? Result.Ok(basicFolders) : Result.fail()));

            return this;
        },
    };

    when = {
        build: async () => {
            this.treeCalculationHandlerService = new TreeCalculationHandlerService(this.mockOptions);
        },
        execute: async (changes: BasicFolderChange) => this.get.treeCalculationHandlerService().execute(changes),
    };

    get = {
        treeCalculationHandlerService: () => this.treeCalculationHandlerService,
    };
}
