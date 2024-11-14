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
    getBasicFolderById(id: string): Promise<Result<BasicFolder>>;
    saveBasicFolders(basicFolders: BasicFolder[]): Promise<Result<void>>;
    deleteBasicFolderByIds(ids: string[]): Promise<Result<void[]>>;
    getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]): Promise<Result<FoldersIdsAndsUpdatedAt[]>>;

    // all get registeredFolders are only valids, not other kinds of error !!!
    getRegisteredFoldersById(folderId: string): Promise<Result<RegisteredFolder[]>>;
    getRegisteredFoldersByIds(folderIds: string[]): Promise<Result<RegisteredFolder[]>>;
    getRegisteredFoldersByIdAndPassword(folderId: string, password: string): Promise<Result<RegisteredFolder[]>>;
    getRegisteredFoldersByUpn(upn: string): Promise<Result<RegisteredFolder[]>>;
    upsertRegisteredFolder(folders: RegisteredFolder): Promise<Result<void>>;
    upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>>;
    deleteregisteredFoldersByIds(ids: string[]): Promise<Result<void>>;
    deleteregisteredFoldersByIdsForUpn(ids: string[], upn: string): Promise<Result<void>>;
    updateRegistrationByFolderIds(folderIds: string[]): Promise<Result<void>>; // put now()
    updateRegistrationByUpn(upn: string): Promise<Result<void>>; // put now()
    updateRegistrationByUpnAndFolderIds(folderIds: string[], upn: string): Promise<Result<void>>; // put now()
    getExpiredRegisteredFolders(registrationThreshold: string, validPasswordThreshold: string): Promise<Result<RegisteredFolder[]>>;
}
