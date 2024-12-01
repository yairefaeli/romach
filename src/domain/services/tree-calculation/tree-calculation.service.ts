import {
    folderMapper,
    RomachEnemyFolder,
    RomachEnemyFolderDto,
    RomachEnemyFoldersTree,
    RomachEnemyFoldersTreeHierarchyDto,
    RomachEnemyFoldersTreeNode,
} from '../../romach-enemy-folders';
import { BasicFolder, RomachEnemyFolderDto } from '../../entities/BasicFolder';
import { Hierarchy } from '../../entities/Hierarchy';
import { groupBy, isEmpty, isNil } from 'lodash';
import { Tree } from '../../entities/Tree';
import { Result } from 'rich-domain';

export class TreeCalculationService {
    calculateTreeTest(basicFolders: BasicFolder[], hierarchies: Hierarchy[]): Promise<Result<Tree>> {
        return {
            // updatedAt: Timestamp.now(),
            // nodes: [],
            //
        };
    }

    calculateTree(
        basicFolderDtos: RomachEnemyFolderDto[],
        hierarchies: RomachEnemyFoldersTreeHierarchyDto[],
    ): { tree: RomachEnemyFoldersTree; categoriesCount: number } {
        if (isEmpty(hierarchies) || isNil(basicFolderDtos)) {
            return { tree: { nodes: [] }, categoriesCount: 0 };
        }

        let categoryCount = 0;

        const folders: RomachEnemyFolder[] = basicFolderDtos.map(folderMapper);

        const foldersByCategory = groupBy(folders, (folder) => folder.category);

        const nodes = hierarchies.map((hierarchy) => transformNode(hierarchy));

        return { tree: { nodes }, categoriesCount: categoryCount };

        function transformNode(hierarchy: RomachEnemyFoldersTreeHierarchyDto): RomachEnemyFoldersTreeNode {
            categoryCount += 1;

            const folderNodes: RomachEnemyFoldersTreeNode[] = (foldersByCategory[hierarchy.name] ?? []).map(
                (folder) => ({
                    type: 'category',
                    id: folder.id,
                    name: folder.name,
                    children: [],
                }),
            );

            if (hierarchy.children.length === 0) {
                return {
                    type: 'category',
                    id: hierarchy.id,
                    name: hierarchy.displayName,
                    children: folderNodes,
                };
            }

            return {
                type: 'category',
                id: hierarchy.id,
                name: hierarchy.displayName,
                children: [...folderNodes, ...hierarchy.children.map((child) => transformNode(child))],
            };
        }
    }
}
