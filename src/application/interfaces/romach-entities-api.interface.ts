import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';
import { Folder } from 'src/domain/entities/Folder';
import { ProtedctedFolderErrorStatus } from 'src/domain/entities/ProtectedFolderStatus';
import { Timestamp } from 'src/domain/entities/Timestamp';

export interface RomachEntitiesApiInterface {

  getFolderByIdWithPassword(
    folderId: string,
    Password: string
  ): Promise<Result<Folder, ProtedctedFolderErrorStatus>>;

  getFolderByIdWithoutPassword(
    folderId: string
  ): Promise<Result<Folder, ProtedctedFolderErrorStatus>>;

  getBasicFoldersByTimestamp(
    timestamp: Timestamp
  ): Promise<Result<BasicFolder[]>>;

  getHierarchies(): Promise<Result<Hierarchy[]>>

  checkPassword(id: string, password: string): Promise<Result<boolean>>
}


