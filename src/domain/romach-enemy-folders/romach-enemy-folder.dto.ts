import { RomachEnemyAreaDto, RomachEnemySinglePointDto } from './romach-enemy.dto';

export interface RomachEnemyBasicFolderDto {
    id: string;
    name: string;
    deleted: boolean;
    isLocal: boolean;
    isViewProtected: boolean;
    creationDate: string;
    updatedAt: string;
    category: string;
}

export interface RomachEnemyFolderDto extends RomachEnemyBasicFolderDto {
    entities: {
        areas: RomachEnemyAreaDto[];
        points: RomachEnemySinglePointDto[];
    };
}
