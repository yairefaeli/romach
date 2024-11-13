import { FolderErrorStatus, ProtedctedFolderErrorStatus } from 'src/domain/entities/ProtectedFolderStatus';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/Folder';
import { Result } from 'rich-domain';

export interface RomachEntitiesApiInterface {
    getFolderByIdWithPassword(folderId: string, Password: string): Promise<Result<Folder, ProtedctedFolderErrorStatus>>;
    getFoldersByIdWithPassword(
        input: { folderId: string; password: string }[],
    ): Promise<Result<Folder[], ProtedctedFolderErrorStatus>>;
    getFolderByIdWithoutPassword(folderId: string): Promise<Result<Folder, FolderErrorStatus>>;
    getFoldersByIdWithoutPassword(folderId: string[]): Promise<Result<Folder[], FolderErrorStatus>>;

    getBasicFoldersByTimestamp(timestamp: Timestamp): Promise<Result<BasicFolder[]>>;

    getHierarchies(): Promise<Result<Hierarchy[]>>;

    checkPasswords(id: string, password: string): Promise<Result<boolean>>;
}
