import { FolderErrorStatus } from 'src/domain/entities/ProtectedFolderStatus';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Hierarchy } from '../../../domain/entities/hierarchy';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/folder';
import { Result } from 'rich-domain';

export interface RomachEntitiesApiInterface {
    fetchFolderByIdAndPassword(input: {
        folderId: string;
        password?: string;
    }): Promise<Result<Folder, FolderErrorStatus>>;

    fetchFoldersByIdsAndPasswords(
        input: {
            folderId: string;
            password?: string;
        }[],
    ): Promise<Result<Folder[], FolderErrorStatus>>;

    fetchBasicFoldersByTimestamp(timestamp: Timestamp): Promise<Result<BasicFolder[]>>;

    fetchHierarchies(): Promise<Result<Hierarchy[]>>;

    checkPassword(id: string, password: string): Promise<Result<boolean>>;
}
