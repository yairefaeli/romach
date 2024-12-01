import { RomachEnemyAreaDto, RomachEnemySinglePointDto } from './romach-enemy.dto';
import { RomachEnemyFolderErrorType } from './romach-enemy.interface';
import { RomachEnemyFolderDto } from './romach-enemy-folder.dto';

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
    updatedAt: string;
    category: string;
    entities: {
        areas: RomachEnemyAreaDto[];
        points: RomachEnemySinglePointDto[];
    };
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

export const folderMapper = (folder: RomachEnemyFolderDto): RomachEnemyFolder => {
    return {
        type: 'folder',
        id: folder.id,
        name: folder.name,
        category: folder.category,
        updatedAt: folder.updatedAt,
        isViewProtected: folder.isViewProtected,
        entities: folder.entities,
    };
};
