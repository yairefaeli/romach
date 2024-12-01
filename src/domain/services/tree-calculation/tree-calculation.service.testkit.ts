import { TreeCalculationService } from './tree-calculation.service';

jest.mock('./tree-calculation.service', () => ({
    TreeCalculationService: jest.fn().mockImplementation(() => ({
        calculateTree: jest.fn(),
    })),
}));

export const TreeCalculationServiceTestkit = () => {
    const treeCalculationService = new TreeCalculationService();

    const mockCalculateTree = (value: ReturnType<TreeCalculationService['calculateTree']>) => {
        treeCalculationService.calculateTree = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    return { mockCalculateTree, treeCalculationService: () => treeCalculationService };
};
