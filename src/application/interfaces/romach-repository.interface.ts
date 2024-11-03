import { FoldersByIdResponse } from '../view-model/folders-by-ids-response';
import { RegisteredFolder } from '../../domain/entities/RegisteredFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';
import { Folder } from 'src/domain/entities/Folder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from '../../domain/entities/Timestamp';

export type NullableTimestamp = Timestamp | null;

export interface RomachRepositoryInterface {
  saveHierarchies(hierarchy: Hierarchy[]): Promise<void>;
  saveBasicFoldersTimestamp(timestamp: Timestamp): Promise<Result<void>>;
  getBasicFoldersTimestamp(): Promise<Result<NullableTimestamp>>;
  getHierarchies(): Promise<Result<Hierarchy[]>>;
  saveBasicFolders(basicFolder: BasicFolder[]): Promise<Result<FoldersByIdResponse>>;
  saveBasicFoldersById(ids: string[]): Promise<Result<FoldersByIdResponse>>;
  getFoldersByIds(ids: string[]): Promise<Result<FoldersByIdResponse[]>>;
  deleteBasicFolderByIds(ids: string[]): Promise<Result<void>>;
  getBasicFolders(ids: string[]): Promise<Result<BasicFolder[]>>;
  getRegisteredFoldersByUpn(upn: string): Promise<Result<string[]>>;
  upsertRegisteredFolders(folders: FoldersByIdResponse[]): Promise<Result<void>>;
  upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>>;
  updateFolderForAllUsers(folder: Folder): Promise<void>;
  findUniquePasswordsForFolder(folderId: BasicFolder): Promise<string[]>;
  updateFolderForUsersWithPassword(folder: Folder, password: string): Promise<void>;
  markPasswordInvalidForUsers(folderId: string, password: string): Promise<void>;
  getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]): Promise<Result<{ id: string, updatedAt: string }[]>>;
}