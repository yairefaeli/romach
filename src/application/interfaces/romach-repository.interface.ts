import { RegisteredFolder } from '../../domain/entities/RegisteredFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from '../../domain/entities/Timestamp';
import { FoldersIdsAndsUpdatedAt } from '../view-model/folders-by-ids-response';

export type NullableTimestamp = Timestamp | null;

export interface RomachRepositoryInterface {
  saveHierarchies(hierarchy: Hierarchy[]): Promise<Result<void>>;
  saveBasicFoldersTimestamp(timestamp: Timestamp): Promise<Result<void>>;
  getBasicFoldersTimestamp(): Promise<Result<NullableTimestamp>>;
  getHierarchies(): Promise<Result<Hierarchy[]>>;
  getBasicFolders(): Promise<Result<BasicFolder[]>>;
  saveBasicFolders(basicFolders: BasicFolder[]): Promise<Result<void>>;
  deleteBasicFolderByIds(ids: string[]): Promise<Result<void[]>>;
  getRegisteredFoldersByUpn(upn: string): Promise<Result<RegisteredFolder[]>>;
  upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>>
  getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]): Promise<Result<FoldersIdsAndsUpdatedAt[]>>;
}


