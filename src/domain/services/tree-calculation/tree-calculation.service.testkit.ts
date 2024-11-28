import { TreeCalculationService } from './tree-calculation.service';
import { Tree } from '../../entities/tree';

jest.mock('./tree-calculation.service', () => ({
    TreeCalculationService: jest.fn().mockImplementation(() => ({
        calculateTree: jest.fn(),
    })),
}));

export const TreeCalculationServiceTestkit = () => {
    const treeCalculationService = new TreeCalculationService();

    const mockCalculateTree = (value: Tree) => {
        treeCalculationService.calculateTree = jest.fn().mockReturnValue(value);
    };

    return { mockCalculateTree, treeCalculationService: () => treeCalculationService };
};
