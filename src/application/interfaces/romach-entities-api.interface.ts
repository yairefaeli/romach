import { RegisteredFolderErrorStatus } from '../../domain/entities/RegisteredFolderStatus';
import { FolderNotProtectedError, FoldersByIdResponse, FoldersByIdResponseError, GeneralError, NotFound, WrongPasswordForFolderError } from '../view-model/folders-by-ids-response';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Folder } from '../../domain/entities/Folder';
import { Result } from 'rich-domain';

export interface RomachEntitiesApiInterface {
  fetchFolderById(folderId: string): Promise<Result<BasicFolder, NotFound | GeneralError>>

  fetchFolderByIdWithPassword(
    folderId: string,
    password: any,
  ): Promise<Result<BasicFolder, FoldersByIdResponseError>>;

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


