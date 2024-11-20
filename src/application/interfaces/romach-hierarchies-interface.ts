import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Timestamp } from '../../domain/entities/Timestamp';
import { Result } from 'rich-domain';

export type NullableTimestamp = Timestamp | null;

export interface HierarchyRepositoryInterface {
    saveHierarchies(hierarchy: Hierarchy[]): Promise<Result<void>>;
    getHierarchies(): Promise<Result<Hierarchy[]>>;
}
