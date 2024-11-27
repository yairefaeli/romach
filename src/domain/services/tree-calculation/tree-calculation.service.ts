import { BasicFolder } from '../../entities/BasicFolder';
import { Hierarchy } from '../../entities/Hierarchy';
import { Timestamp } from '../../entities/Timestamp';
import { Tree } from '../../entities/Tree';


export class TreeCalculationService {
    calculateTree(basicFolders: BasicFolder[], hierarchies: Hierarchy[]): Tree {
        return {
            updatedAt: Timestamp.now(),
            nodes: [],
        };
    }
}
