import { FoldersIdsAndsUpdatedAt } from '../../view-model/folders-by-ids-response';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Result } from 'rich-domain';

export type NullableTimestamp = Timestamp | null;

export interface BasicFoldersRepositoryInterface {
    saveBasicFoldersTimestamp(timestamp: Timestamp): Promise<Result>;

    getBasicFoldersTimestamp(): Promise<Result<NullableTimestamp>>;

    getBasicFolders(): Promise<Result<BasicFolder[]>>;

    getBasicFolderById(id: string): Promise<Result<BasicFolder>>;

    saveBasicFolders(basicFolders: BasicFolder[]): Promise<Result>;

    deleteBasicFolderByIds(ids: string[]): Promise<Result<void, string, {}>>;

    getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]): Promise<Result<FoldersIdsAndsUpdatedAt[]>>;
}
