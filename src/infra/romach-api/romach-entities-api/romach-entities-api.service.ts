import { RomachApiGraphqlClientService } from '../romach-api-graphql-client/romach-api-graphql-client.service';
import { RomachEntitiesApiInterface } from '../../../application/interfaces/romach-entities-api.interface';
import { FolderErrorStatus, FoldersByIdResponse } from '../../../application/view-model/folders-by-ids-response';
import { RegisteredFolderErrorStatus } from '../../../domain/entities/RegisteredFolderStatus';
import { AppLoggerService } from '../../logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { Folder } from '../../../domain/entities/Folder';
import { Result } from 'rich-domain';
import { ProtedctedFolderErrorStatus } from 'src/domain/entities/ProtectedFolderStatus';
import { gql } from 'graphql-request';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';

export class RomachEntitiesApiService implements RomachEntitiesApiInterface {
  constructor(
    private romachApiGraphqlClientService: RomachApiGraphqlClientService,
    private logger: AppLoggerService,
  ) { }

  async getFolderByIdWithPassword(folderId: string, password: string): Promise<Result<BasicFolder, ProtedctedFolderErrorStatus>> {
    try {
      const query = gql`
        query getFolderByIdWithPassword($folderId: String!, $password: String!) {
          getFolder(id: $folderId, password: $password) {
            id
            name
            deleted
            isLocal
            isViewProtected
            isEditProtected
            creationDate
            lastUpdatedTime
            category
            entites
          }
        }
      `;

      const variables = { folderId, password };

      const response = await this.romachApiGraphqlClientService.query<{ folder: RegisteredFolder }>(query, variables);

      if (response.folder) {
        Result.Ok(response.folder);
      } else {
        return Result.fail('not-found');
      }
    } catch (error) {
      this.logger.error('Error fetching folder by ID with password', error);
      return Result.fail('general-error');
    }
  }

  async getFolderById(folderId: string): Promise<Result<BasicFolder, FolderErrorStatus>> {
    try {
      const query = gql`
        query getFolderById($folderId: String!) {
          getFolder(id: $folderId) {
            id
            name
            deleted
            isLocal
            isViewProtected
            isEditProtected
            creationDate
            lastUpdatedTime
            category
          }
        }
      `;

      const variables = { folderId };

      const response = await this.romachApiGraphqlClientService.query<{ folder: RegisteredFolder }>(query, variables);

      if (response.folder) {
        Result.Ok()
      }

    } catch (error) {
      this.logger.error('Error fetching folder by ID', error);
      return Result.fail('general-error');
    }
  }

  getBasicFoldersByTimestamp(timestamp: string): Promise<Result<BasicFolder[]>> {
    throw new Error('Method not implemented.');
  }

  getHierarchies(): Promise<Result<Hierarchy[]>> {
    throw new Error('Method not implemented.');
  }
  checkPassword(id: string, Password: string): Promise<Result<Folder, RegisteredFolderErrorStatus>> {
    throw new Error('Method not implemented.');
  }
  getFoldersByIds(input: { id: string; password?: string; }[]): Promise<Result<FoldersByIdResponse[]>> {
    throw new Error('Method not implemented.');
  }

}
