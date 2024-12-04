import { RomachEntitiesApiInterface } from '../../../application/interfaces/romach-entites-api/romach-entities-api.interface';
import { RomachApiGraphqlClientService } from '../romach-api-graphql-client/romach-api-graphql-client.service';
import { FolderErrorStatus } from 'src/domain/entities/ProtectedFolderStatus';
import { AppLoggerService } from '../../logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/Folder';
import { gql } from 'graphql-request';
import { Result } from 'rich-domain';
import { isEmpty } from 'lodash';

interface apiInput {
    folderId: string;
    password?: string;
}

export class RomachEntitiesApiService implements RomachEntitiesApiInterface {
    constructor(
        private romachApiGraphqlClientService: RomachApiGraphqlClientService,
        private logger: AppLoggerService,
    ) {}

    async fetchFolderByIdAndPassword(input: apiInput): Promise<Result<Folder, FolderErrorStatus>> {
        const query = gql`
            query getFolderByIdAndPassword($id: String!, $password: String) {
                folder(id: $id, password: $password) {
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

        const variables = { id: input.folderId, password: input.password };

        try {
            const response = await this.romachApiGraphqlClientService.query<{ folder: Folder }>(query, variables);
            if (response.folder) {
                return Result.Ok(response.folder);
            } else {
                return Result.fail('not-found');
            }
        } catch (error) {
            this.logger.error('Error fetching folder by ID with password', error);
            return Result.fail('general-error');
        }
    }

    async fetchFoldersByIdsAndPasswords(input: apiInput[]): Promise<Result<Folder[], FolderErrorStatus>> {
        const query = gql`
      query getFoldersByIdsAndPasswords($inputs: [$id: String!, $password: String]!) {
        folders(inputs: $inputs) {
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

        const variables = { inputs: input };

        try {
            const response = await this.romachApiGraphqlClientService.query<{ folders: Folder[] }>(query, variables);
            if (!isEmpty(response.folders)) {
                return Result.Ok(response.folders);
            } else {
                return Result.fail('not-found');
            }
        } catch (error) {
            this.logger.error('Error fetching folders by IDs and passwords', error);
            return Result.fail('general-error');
        }
    }

    async fetchBasicFoldersByTimestamp(timestamp: Timestamp): Promise<Result<BasicFolder[]>> {
        try {
            const query = gql`
                query getBasicFoldersByTimestamp($timeStamp: Date!) {
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

    fetchHierarchies(): Promise<Result<Hierarchy[]>> {
        throw new Error('Method not implemented.');
    }
}
