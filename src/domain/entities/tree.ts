import { BasicFolder } from './BasicFolder';
import { BaseCategory } from './Category';
import { Timestamp } from './Timestamp';

export interface Tree {
    updatedAt?: Timestamp;
    nodes: TreeNode[];
}

export interface TreeNodeType<T> {
    type: 'folder' | 'category';
}

export interface BasicFolderTreeNode extends TreeNodeType<BasicFolder>, BasicFolder {
    type: 'folder';
}

export interface BaseCategoryTreeNode extends TreeNodeType<BaseCategory>, BaseCategory {
    type: 'category';
}

export type TreeNode = BasicFolderTreeNode | BaseCategoryTreeNode;
