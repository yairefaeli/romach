import { TreeCalculationService } from './tree-calculation.service';
import { Tree } from '../../entities/tree';

export const TreeCalculationServiceTestkit = () => {
    const treeCalculationService = {
        calulateTree: new TreeCalculationService(),
    };
    treeCalculationService.calculateTree = jest.fn();

    const mockCalculateTree = (value: Tree) => {
        treeCalculationService.calculateTree = jest.fn().mockReturnValue(value);
    };

    return { mockCalculateTree, treeCalculationService: () => treeCalculationService };
};
