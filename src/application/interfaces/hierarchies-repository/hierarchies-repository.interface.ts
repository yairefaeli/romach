import { Hierarchy } from '../../../domain/entities/hierarchy';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Result } from 'rich-domain';

export type NullableTimestamp = Timestamp | null;

export interface HierarchiesRepositoryInterface {
    saveHierarchies(hierarchy: Hierarchy[]): Promise<Result>;

    getHierarchies(): Promise<Result<Hierarchy[]>>;
}
