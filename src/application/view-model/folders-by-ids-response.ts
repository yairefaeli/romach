import { RegisteredFolderStatus } from '../../domain/entities/RegisteredFolderTypes';
import { Folder } from '../../domain/entities/Folder';

export interface FoldersByIdResponse {
    upn: string;
    folderId: string;
    password?: string;
    content: Folder | null;
    status: RegisteredFolderStatus;
}

export type FoldersIdsAndsUpdatedAt = { id: string; updatedAt: string };
