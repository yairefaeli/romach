import { RegisteredFolderStatus } from '../../domain/entities/RegisteredFolderStatus';
import { Folder } from '../../domain/entities/Folder';

export interface FoldersByIdResponse {
  folderId: string;
  upn: string;
  password?: string;
  status: RegisteredFolderStatus;
  content: Folder | null;
}


export type FoldersIdsAndsUpdatedAt = { id: string, updatedAt: string };