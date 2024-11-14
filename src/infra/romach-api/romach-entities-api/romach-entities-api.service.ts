import { RomachApiGraphqlClientService } from '../romach-api-graphql-client/romach-api-graphql-client.service';
import { RomachEntitiesApiInterface } from '../../../application/interfaces/romach-entities-api.interface';
import { AppLoggerService } from '../../logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';
import { ProtectedFolderErrorStatus } from 'src/domain/entities/ProtectedFolderStatus';
import { gql } from 'graphql-request';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/Folder';

export class RomachEntitiesApiService implements RomachEntitiesApiInterface {
  constructor(
    private romachApiGraphqlClientService: RomachApiGraphqlClientService,
    private logger: AppLoggerService,
  ) { }

  async getFolderByIdWithoutPassword(folderId: string): Promise<Result<Folder, ProtectedFolderErrorStatus>> {
    try {
      const query = gql`
        query getFolderByIdWithoutPassword($folderId: String!) {
          getFolder(id: $folderId) {
            id
            name
            deleted
            isLocal
            isViewProtected
            isEditProtected
            creationDate
            updatedAt: lastUpdatedTime
            category
            entites
          }
        }
      `;

      const variables = { folderId };

      const response = await this.romachApiGraphqlClientService.query<{ folder: RegisteredFolder }>(query, variables);

      if (response.folder) {
        Result.Ok(response.folder);
      } else {
        return Result.fail('not-found');
      }
    } catch (error) {
      this.logger.error('Error fetching folder by ID without password', error);
      return Result.fail('general-error');
    }
  }

  async getFolderByIdWithPassword(folderId: string, password: string): Promise<Result<Folder, ProtectedFolderErrorStatus>> {
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
            updatedAt: lastUpdatedTime
            category
            entites
          }
        }
      `;

      const variables = { folderId, password };

      const response = await this.romachApiGraphqlClientService.query<{ folder: Folder }>(query, variables);

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

  async getBasicFoldersByTimestamp(timestamp: Timestamp): Promise<Result<BasicFolder[]>> {
    try {
      const query = gql`
        query getBasicFoldersByTimestamp($timeStamp: Date! ) {
          folders(lastUpdatedTime: $timeStamp, isLocal: false) {
            id
            name
            deleted
            isLocal
            creationDate
            category
            isViewProtected
            updatedAt: lastUpdatedTime
          }
        }
      `;

      const variables = { timestamp };

      const response = await this.romachApiGraphqlClientService.query<{ folder: BasicFolder }>(query, variables);

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

  getHierarchies(): Promise<Result<Hierarchy[]>> {

    throw new Error('Method not implemented.');
  }

  async checkPassword(id: string, password: string): Promise<Result<boolean>> {
    const query = gql`
        query checkPassword($folderId: String!, $viewPassword: String!) {
            checkPasswords(folderId: $folderId, viewPassword: $viewPassword) {
            }
        }
    `;

    const variables = { folderId: id, viewPassword: password };

    try {
      const response = await this.romachApiGraphqlClientService.query<{ data: boolean }>(query, variables);
      if (response.data) {
        return Result.Ok(true);
      }
      return Result.Ok(false);
    } catch (error) {
      return Result.fail(`Failed to check password: ${error.message}`);
    }
  }
}
