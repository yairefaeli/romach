import { RomachEnemyFolderErrorType } from './romach-enemy.interface';
import { BasicFolder } from '../entities/BasicFolder';
import { Timestamp } from '../entities/Timestamp';

export const RomachEnemyFoldersFinderTypename = 'RomachEnemyFolderFinder';

export type RomachEnemyFoldersTreeNodeType = 'category' | 'folder' | 'folderError';

export interface RomachEnemyFoldersTreeBaseNode {
    id: string;
    type: RomachEnemyFoldersTreeNodeType;
}

export interface RomachEnemyFolderCategory extends RomachEnemyFoldersTreeBaseNode {
    type: 'category';
    name: string;
    children: RomachEnemyFoldersTreeNode[];
}

export interface RomachEnemyFolder extends RomachEnemyFoldersTreeBaseNode {
    type: 'folder';
    name: string;
    isViewProtected: boolean;
    updatedAt: Timestamp;
    category: string;
    // entities: {
    //     areas: RomachEnemyAreaDto[];
    //     points: RomachEnemySinglePointDto[];
    // };
}

export interface RomachEnemyErrorFolder
    extends Omit<RomachEnemyFolder, 'entities' | 'type' | 'isViewProtected' | 'category'> {
    type: 'folderError';
    errorType: RomachEnemyFolderErrorType;
}

export type RomachEnemyFoldersTreeNode = RomachEnemyFolderCategory | RomachEnemyFolder;

export interface RomachEnemyFoldersTree {
    updatedAt?: string;
    nodes: RomachEnemyFoldersTreeNode[];
}

export const folderMapper = (folder: BasicFolder): RomachEnemyFolder => {
    return {
        type: 'folder',
        id: folder.getProps().id,
        name: folder.getProps().name,
        category: folder.getProps().categoryId,
        updatedAt: folder.getProps().updatedAt,
        isViewProtected: folder.getProps().isViewProtected,
        // entities: folder.getProps().entities,
    };
};
