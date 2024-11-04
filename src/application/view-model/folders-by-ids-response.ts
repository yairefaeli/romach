import { RegisteredFolderStatus } from '../../domain/entities/RegisteredFolderStatus';
import { Folder } from '../../domain/entities/Folder';

export interface FoldersByIdResponse {
  id: string;
  status: RegisteredFolderStatus;
  content: Folder | null;
}


export interface WrongPasswordForFolderError {
  error: 'WrongPasswordForFolderError';
  id: string;
}

export interface FolderNotProtectedError {
  error: 'FolderNotProtectedError';
  id: string;
}

export interface NotFound {
  error: 'NotFound';
  id: string;
}

export interface GeneralError {
  error: 'GeneralError';
  id: string;
}

export type FoldersIdsAndsUpdatedAt = { id: string, updatedAt: string };

export type FoldersByIdResponseError = WrongPasswordForFolderError | FolderNotProtectedError | NotFound | GeneralError;