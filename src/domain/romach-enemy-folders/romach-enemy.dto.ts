// import { Geometry } from '@turf/helpers';

export interface RomachEnemyDto {
    id: string;
    name: string;
    fillColor: string;
    entityColor: string;
    // geometry: Geometry;
    lastUpdateDate: string;
    borderWidth?: number;
    borderStyle?: BorderStyle;
    __typename: 'RomachEnemy';
    geometryType: GeometryType;
    notes: string;
    aids: RomachAids[];
    internalMargins: number;
    externalMargins: number;
}

export interface RomachAids {
    id: string;
    name: string;
    link: string;
    type: string;
    lastUpdatedUser: string;
    lastUpdatedTime: string;
}

export interface RomachEnemyAreaDto extends RomachEnemyDto {
    // geometry: LineString;
    creationDate: string;
}

export interface RomachEnemySinglePointDto extends RomachEnemyDto {
    angle: number;
    // geometry: Point;
    mainRadius: number;
    secondaryRadius: number;
}

export type GeometryType = 'LineString' | 'Polygon' | 'Point' | 'Circle';

export interface RomachEnemyPolygonDto extends RomachEnemyAreaDto {
    geometryType: 'Polygon';
    isClosed: boolean;
}

export interface RomachEnemyLineStringDto extends RomachEnemyAreaDto {
    geometryType: 'LineString';
}

export interface RomachEnemyPointDto extends RomachEnemySinglePointDto {
    geometryType: 'Point';
}

export interface RomachEnemyCircleDto extends RomachEnemySinglePointDto {
    geometryType: 'Circle';
}

export const isRomachEnemySinglePoint = (romachEnemy: RomachEnemyDto): romachEnemy is RomachEnemySinglePointDto =>
    romachEnemy.geometryType === 'Point' || romachEnemy.geometryType === 'Circle';

export const isRomachEnemyArea = (romachEnemy: RomachEnemyDto): romachEnemy is RomachEnemyAreaDto =>
    romachEnemy.geometryType === 'Polygon' || romachEnemy.geometryType === 'LineString';

type BorderStyle = 'STRAIGHT' | 'SMALL_DASHED' | 'BIG_DASHED' | 'DASHED_DOTTED';

export type RomachEnemyArea =
    | RomachEnemyPolygonDto
    | RomachEnemyLineStringDto
    | RomachEnemyPointDto
    | RomachEnemyCircleDto;
