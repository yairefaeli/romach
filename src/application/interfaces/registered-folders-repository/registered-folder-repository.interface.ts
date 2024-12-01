import { RegisteredFolder } from '../../../domain/entities/RegisteredFolder';
import { Result } from 'rich-domain';

export interface RegisteredFolderRepositoryInterface {
    deleteRegisteredFoldersByIds(ids: string[]): Promise<Result>;
    getExpiredRegisteredFolders(): Promise<Result<RegisteredFolder[]>>;
    upsertRegisteredFolder(folders: RegisteredFolder): Promise<Result>;
    upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result>;
    getRegisteredFoldersByUpn(upn: string): Promise<Result<RegisteredFolder[]>>;
    getRegisteredFoldersWithFailedStatuses(): Promise<Result<RegisteredFolder[]>>;
    getRegisteredFoldersById(folderId: string): Promise<Result<RegisteredFolder[]>>; // why you are return RegisteredFolder array?
    deleteRegisteredFoldersByIdsForUpn(ids: string[], upn: string): Promise<Result>;
    getRegisteredFoldersByIds(folderIds: string[]): Promise<Result<RegisteredFolder[]>>;
    updateRegistrationByUpnAndFolderIds(folderIds: string[], upn: string): Promise<Result>; // put now()
    getRegisteredFoldersByIdAndPassword(folderId: string, password: string): Promise<Result<RegisteredFolder[]>>;
}
