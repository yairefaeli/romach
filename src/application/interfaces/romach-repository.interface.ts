import { FoldersByIdResponse, FoldersIdsAndsUpdatedAt } from '../view-model/folders-by-ids-response';
import { RegisteredFolder } from '../../domain/entities/RegisteredFolder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Timestamp } from '../../domain/entities/Timestamp';
import { Result } from 'rich-domain';

export type NullableTimestamp = Timestamp | null;

export interface RomachRepositoryInterface {
  saveHierarchies(hierarchy: Hierarchy[]): Promise<Result<void>>;
  saveBasicFoldersTimestamp(timestamp: Timestamp): Promise<Result<void>>;
  getBasicFoldersTimestamp(): Promise<Result<NullableTimestamp>>;
  getHierarchies(): Promise<Result<Hierarchy[]>>;
  getBasicFolders(): Promise<Result<BasicFolder[]>>;

  saveBasicFolders(basicFolder: BasicFolder[]): Promise<Result<void>>;
  saveBasicFoldersById(ids: string[]): Promise<Result<void>>;
  getRegisteredFoldersByUpn(upn: string): Promise<Result<string[]>>; // return folders ids??
  upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>>;
  getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]): Promise<Result<FoldersIdsAndsUpdatedAt[]>>;

  getFoldersByIds(ids: string[]): Promise<Result<FoldersByIdResponse[]>>;
  deleteBasicFolderByIds(ids: string[]): Promise<Result<void>>;
  getBasicFoldersByIds(ids: string[]): Promise<Result<BasicFolder[]>>;
  getBasicFolderById(ids: string): Promise<Result<BasicFolder>>;
  // updateFolderForAllUsers(folder: Folder): Promise<void>;
  // findUniquePasswordsForFolder(folderId: BasicFolder): Promise<string[]>;
  // updateFolderForUsersWithPassword(folder: Folder, password: string): Promise<void>;
  // markPasswordInvalidForUsers(folderId: string, password: string): Promise<void>;
  getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]): Promise<Result<{ id: string; updatedAt: string }[]>>;

  getRegisteredFoldersByUpn(upn: string): Promise<Result<RegisteredFolder[]>>;
  getRegisteredFoldersById(folderId: string): Promise<Result<RegisteredFolder[]>>;
  getRegisteredFoldersByIdAndPassword(folderId: string, password: string): Promise<Result<RegisteredFolder[]>>;
  upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>>;
  upsertRegisteredFolder(folders: RegisteredFolder): Promise<Result<void>>;
}
