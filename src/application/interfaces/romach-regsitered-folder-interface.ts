import { RegisteredFolder } from '../../domain/entities/RegisteredFolder';
import { Result } from 'rich-domain';

export interface RegisteredFolderRepositoryInterface {
    getRegisteredFoldersById(folderId: string): Promise<Result<RegisteredFolder[]>>; // why you are return RegisteredFolder array?
    getRegisteredFoldersByIds(folderIds: string[]): Promise<Result<RegisteredFolder[]>>;
    getRegisteredFoldersByIdAndPassword(folderId: string, password: string): Promise<Result<RegisteredFolder[]>>;
    getRegisteredFoldersByUpn(upn: string): Promise<Result<RegisteredFolder[]>>;
    upsertRegisteredFolder(folders: RegisteredFolder): Promise<Result<void>>;
    upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>>;
    deleteRegisteredFoldersByIds(ids: string[]): Promise<Result<void>>;
    deleteRegisteredFoldersByIdsForUpn(ids: string[], upn: string): Promise<Result<void>>;
    updateRegistrationByUpnAndFolderIds(folderIds: string[], upn: string): Promise<Result<void>>; // put now()
    getExpiredRegisteredFolders(): Promise<Result<RegisteredFolder[]>>;
    getRegisteredFoldersWithFailedStatuses(): Promise<Result<RegisteredFolder[]>>;
}
