import { BasicFolder } from '../../entities/BasicFolder';
import { Hierarchy } from '../../entities/Hierarchy';
import { Timestamp } from '../../entities/Timestamp';
import { groupBy, isEmpty, isNil } from 'lodash';
import { Folder } from '../../entities/folder';
import { Tree } from '../../entities/Tree';

export class TreeCalculationService {
    calculateTreeTest(basicFolders: BasicFolder[], hierarchies: Hierarchy[]): Tree {
        return {
            updatedAt: Timestamp.now(),
            nodes: [],
        };
    }

    calculateTree(
        basicFolders: BasicFolder[],
        hierarchies: Hierarchy[],
    ): {
        categoriesCount: number;
        tree: { nodes: Folder[] };
    } {
        if (isEmpty(hierarchies) || isNil(basicFolders)) {
            return { tree: { nodes: [] }, categoriesCount: 0 };
        }

        let categoryCount = 0;

        // const folders: Folder[];

        const foldersByCategory = groupBy((folder) => folder.getProps().basicFolder.getProps().categoryId);

        const nodes = hierarchies.map((hierarchy) => transformNode(hierarchy));

        return { tree: { nodes }, categoriesCount: categoryCount };

        function transformNode(hierarchy: Hierarchy): Folder {
            categoryCount += 1;
            if (hierarchy.getProps().children.length === 0) {
                return {
                    type: 'category',
                    id: hierarchy.getProps().id,
                    name: hierarchy.getProps().displayName,
                    children: foldersByCategory[hierarchy.getProps().displayName] ?? [],
                };
            }

            return {
                type: 'category',
                id: hierarchy.id,
                name: hierarchy.displayName,
                children: [
                    ...(foldersByCategory[hierarchy.name] ?? []),
                    ...(hierarchy.children.map((child) => transformNode(child)) ?? []),
                ],
            };
        }
    }
}
