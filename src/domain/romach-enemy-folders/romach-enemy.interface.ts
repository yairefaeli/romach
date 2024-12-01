import { RomachEnemyErrorFolder, RomachEnemyFolder } from './romach-enemy-folder-finder.interface';
import { GeometryType } from './romach-enemy.dto';

export const RomachEnemyTypename = 'RomachEnemy';

export interface FolderFetchError {
    id: string;
    errorType: RomachEnemyFolderErrorType;
}

export interface RomachEnemyFoldersTreeHierarchyDto {
    id: string;
    name: string;
    displayName: string;
    children: RomachEnemyFoldersTreeHierarchyDto[];
}

export interface RomachEnemyFolderByIdsResult {
    entities: RomachEnemyFolder[];
    errors: string[];
    notFound: string[];
}

export type RomachEnemyFolderByIdsFetchResult = (RomachEnemyFolder | RomachEnemyErrorFolder)[];

export interface WatchListEntity {
    id: string;
    ttl: number;
    error?: RomachEnemyFolderErrorType;
}

export type RomachEnemyFoldersTreePolledType = 'Hierarchy' | 'Folders';

export type RomachEnemyFolderErrorType = 'NOT_FOUND' | 'GENERAL_ERROR';

export const RomachEnemyGeometryIcon: Record<GeometryType, string> = {
    Point: 'points',
    Polygon: 'area',
    LineString: 'line',
    Circle: 'circle',
};
