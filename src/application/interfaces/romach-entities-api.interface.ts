import { FolderErrorStatus, ProtectedFolderErrorStatus } from 'src/domain/entities/ProtectedFolderStatus';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/Folder';
import { Result } from 'rich-domain';

export interface RomachEntitiesApiInterface {
    getFolderByIdWithPassword(folderId: string, Password: string): Promise<Result<Folder, ProtectedFolderErrorStatus>>;
    getFoldersByIdWithPassword(
        input: { folderId: string; password: string }[],
    ): Promise<Result<Folder[], ProtectedFolderErrorStatus>>;
    getFolderByIdWithoutPassword(folderId: string): Promise<Result<Folder, FolderErrorStatus>>;
    getFoldersByIdsWithoutPassword(folderId: string[]): Promise<Result<Folder[], FolderErrorStatus>>;

    getBasicFoldersByTimestamp(timestamp: Timestamp): Promise<Result<BasicFolder[]>>;

    getHierarchies(): Promise<Result<Hierarchy[]>>;

    checkPassword(id: string, password: string): Promise<Result<boolean>>;
}
