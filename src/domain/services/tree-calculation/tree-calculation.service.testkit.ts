import { TreeCalculationService } from './tree-calculation.service';
import { Tree } from '../../entities/tree';
import { Result } from 'rich-domain';

jest.mock('./tree-calculation.service', () => ({
    TreeCalculationService: jest.fn().mockImplementation(() => ({
        calculateTree: jest.fn(),
    })),
}));

export const TreeCalculationServiceTestkit = () => {
    const treeCalculationService = new TreeCalculationService();

    const mockCalculateTree = (value: Result<Tree>) => {
        treeCalculationService.calculateTree = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    return { mockCalculateTree, treeCalculationService: () => treeCalculationService };
};
