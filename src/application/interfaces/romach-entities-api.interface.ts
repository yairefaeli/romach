import { FolderErrorStatus } from 'src/domain/entities/ProtectedFolderStatus';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/Folder';
import { Result } from 'rich-domain';

interface apiInput {
    folderId: string;
    password: string;
}

export interface RomachEntitiesApiInterface {
    /**
     * @deprecated oldFunction is deprecated and will be removed in future versions.
     **/
    fetchFolderByIdWithPassword(folderId: string, Password: string): Promise<Result<Folder, FolderErrorStatus>>;
    /**
     * @deprecated oldFunction is deprecated and will be removed in future versions.
     **/
    fetchFoldersByIdsWithPassword(input: apiInput[]): Promise<Result<Folder[], FolderErrorStatus>>;

    /**
     * @deprecated oldFunction is deprecated and will be removed in future versions.
     **/
    fetchFolderByIdWithoutPassword(folderId: string): Promise<Result<Folder, FolderErrorStatus>>;

    /**
     * @deprecated oldFunction is deprecated and will be removed in future versions.
     **/
    fetchFoldersByIdsWithoutPassword(folderId: string[]): Promise<Result<Folder[], FolderErrorStatus>>;

    fetchFoldersByIdsAndPasswords(input: apiInput[]): Promise<Result<Folder, FolderErrorStatus>>;

    fetchBasicFoldersByTimestamp(timestamp: Timestamp): Promise<Result<BasicFolder[]>>;

    fetchHierarchies(): Promise<Result<Hierarchy[]>>;

    checkPassword(id: string, password: string): Promise<Result<boolean>>;
}
