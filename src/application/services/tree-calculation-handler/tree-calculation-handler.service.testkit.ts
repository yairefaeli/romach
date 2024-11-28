import { TreeCalculationHandlerService } from './tree-calculation-handler.service';
import { Result } from 'rich-domain';

jest.mock('./tree-calculation-handler.service', () => ({
    TreeCalculationHandlerService: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

export const TreeCalculationHandlerServiceTestkit = () => {
    const treeCalculationHandlerServiceMock = new TreeCalculationHandlerService(null);

    const mockExecute = (value: Result) =>
        (treeCalculationHandlerServiceMock.execute = jest.fn().mockReturnValue(Promise.resolve(value)));

    return { mockExecute, treeCalculationHandlerService: () => treeCalculationHandlerServiceMock };
};
