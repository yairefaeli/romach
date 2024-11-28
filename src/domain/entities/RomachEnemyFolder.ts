import { Timestamp } from './Timestamp';
import { Point } from './Point';
import { Area } from './Area';

export interface RomachEnemyFolder {
    type: 'folder';
    name: string;
    isViewProtected: boolean;
    updatedAt: Timestamp;
    category: string;
    entites: {
        areas: Area[];
        points: Point[];
    };
}
