import {
    folderMapper,
    RomachEnemyFolder,
    RomachEnemyFoldersTree,
    RomachEnemyFoldersTreeNode,
} from '../../romach-enemy-folders';
import { BasicFolder } from '../../entities/BasicFolder';
import { Hierarchy } from '../../entities/hierarchy';
import { groupBy, isEmpty, isNil } from 'lodash';
import { Injectable } from '@nestjs/common';
import { Result } from 'rich-domain';

@Injectable()
export class TreeCalculationService {
    calculateTree(
        basicFolderDtos: BasicFolder[],
        hierarchies: Hierarchy[],
    ): Result<{ tree: RomachEnemyFoldersTree; categoriesCount: number }> {
        if (isEmpty(hierarchies) || isNil(basicFolderDtos)) {
            return Result.Ok({ tree: { nodes: [] }, categoriesCount: 0 });
        }

        let categoryCount = 0;

        const folders: RomachEnemyFolder[] = basicFolderDtos.map(folderMapper);

        const foldersByCategory = groupBy(folders, (folder) => folder.category);

        const nodes = hierarchies.map((hierarchy) => transformNode(hierarchy));

        return Result.Ok({ tree: { nodes }, categoriesCount: categoryCount });

        function transformNode(hierarchy: Hierarchy): RomachEnemyFoldersTreeNode {
            categoryCount += 1;

            const folderNodes: RomachEnemyFoldersTreeNode[] = (foldersByCategory[hierarchy.getProps().name] ?? []).map(
                (folder) => ({
                    type: 'category',
                    id: folder.id,
                    name: folder.name,
                    children: [],
                }),
            );

            if (hierarchy.getProps().children.length === 0) {
                return {
                    type: 'category',
                    id: hierarchy.getProps().id,
                    name: hierarchy.getProps().displayName,
                    children: folderNodes,
                };
            }

            return {
                type: 'category',
                id: hierarchy.getProps().id,
                name: hierarchy.getProps().displayName,
                children: [...folderNodes, ...hierarchy.getProps().children.map((child) => transformNode(child))],
            };
        }
    }
}
