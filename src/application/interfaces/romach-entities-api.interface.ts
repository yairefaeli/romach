import { RegisteredFolderErrorStatus } from '../../domain/entities/RegisteredFolderStatus';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Folder } from '../../domain/entities/Folder';
import { Result } from 'rich-domain';
import { ProtedctedFolderErrorStatus } from 'src/domain/entities/ProtectedFolderStatus';
import { FolderErrorStatus, FoldersByIdResponse } from '../view-model/folders-by-ids-response';

export interface RomachEntitiesApiInterface {
  fetchFolderById(folderId: string): Promise<Result<BasicFolder, FolderErrorStatus>>;

  fetchFolderByIdWithPassword(
    folderId: string,
    password: any,
  ): Promise<Result<BasicFolder, ProtedctedFolderErrorStatus>>;

  getBasicFoldersByTimestamp(
    timestamp: string,
  ): Promise<Result<BasicFolder[]>>;

  getHierarchies(): Promise<Result<Hierarchy[]>>;

  checkPassword(
    id: string,
    password: string,
  ): Promise<Result<Folder, RegisteredFolderErrorStatus>>;

  getFoldersByIds(
    input: { id: string; password?: string }[],
  ): Promise<Result<FoldersByIdResponse[]>>;
}


