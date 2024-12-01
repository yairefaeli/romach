import { TreeCalculationHandlerService } from './tree-calculation-handler.service';
import { Result } from 'rich-domain';

jest.mock('./tree-calculation-handler.service', () => ({
    TreeCalculationHandlerService: jest.fn().mockImplementation(() => ({
        execute: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
    })),
}));

export const TreeCalculationHandlerServiceTestkit = () => {
    const treeCalculationHandlerServiceMock = new TreeCalculationHandlerService(null);

    const mockExecute = (value: Awaited<ReturnType<TreeCalculationHandlerService['execute']>>) =>
        (treeCalculationHandlerServiceMock.execute = jest.fn().mockReturnValue(value));

    return { mockExecute, treeCalculationHandlerService: () => treeCalculationHandlerServiceMock };
};