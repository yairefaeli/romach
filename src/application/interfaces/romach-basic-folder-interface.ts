import { FoldersIdsAndsUpdatedAt } from '../view-model/folders-by-ids-response';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from '../../domain/entities/Timestamp';
import { Result } from 'rich-domain';

export type NullableTimestamp = Timestamp | null;

export interface BasicFolderRepositoryInterface {
    saveBasicFoldersTimestamp(timestamp: Timestamp): Promise<Result<void>>;
    getBasicFoldersTimestamp(): Promise<Result<NullableTimestamp>>;
    getBasicFolders(): Promise<Result<BasicFolder[]>>;
    getBasicFolderById(id: string): Promise<Result<BasicFolder>>;
    saveBasicFolders(basicFolders: BasicFolder[]): Promise<Result<void>>;
    deleteBasicFolderByIds(ids: string[]): Promise<Result<void[]>>;
    getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]): Promise<Result<FoldersIdsAndsUpdatedAt[]>>;
}