import { BasicFoldersRepositoryInterface } from 'src/application/interfaces/basic-folders-repository/basic-folders-repository.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Result } from 'rich-domain';
import { Knex } from 'knex';

export class BasicFoldersRepositoryService implements BasicFoldersRepositoryInterface {
    constructor(
        private readonly knex: Knex,
        private readonly logger: AppLoggerService,
    ) {}

    async getBasicFolderById(id: string): Promise<Result<BasicFolder>> {
        try {
            const folder = await this.knex<BasicFolder>('basic_folders').where('id', id).first();
            if (!folder) {
                return Result.fail('FolderNotFound');
            }
            return Result.Ok(folder);
        } catch (error) {
            this.logger.error(`Error fetching basic folder by ID: ${id}`, error);
            return Result.fail('DatabaseError');
        }
    }

    async getBasicFolders(): Promise<Result<BasicFolder[]>> {
        try {
            const folders = await this.knex<BasicFolder>('basic_folders').select('*');
            return Result.Ok(folders);
        } catch (error) {
            this.logger.error('Error fetching basic folders');
            return Result.fail('DatabaseError');
        }
    }

    async saveBasicFolders(basicFolders: BasicFolder[]): Promise<Result<void>> {
        try {
            await this.knex<BasicFolder>('basic_folders').insert(basicFolders);
            return Result.Ok();
        } catch (error) {
            this.logger.error('Error saving basic folders', error);
            return Result.fail('DatabaseError');
        }
    }

    async deleteBasicFolderByIds(ids: string[]): Promise<Result<void, string, {}>> {
        try {
            await this.knex('basic_folders').whereIn('id', ids).delete();
            return Result.Ok();
        } catch (error) {
            this.logger.error('Failed to delete basic folders', error);
            return Result.fail('Failed to delete basic folders');
        }
    }

    async getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]): Promise<Result<any[]>> {
        try {
            const folders = await this.knex('basic_folders')
                .whereIn('id', folderIds)
                .select('id', 'updated_at as updatedAt');
            return Result.Ok(folders);
        } catch (error) {
            this.logger.error('Error fetching folder IDs and updatedAt', error);
            return Result.fail('DatabaseError');
        }
    }

    async saveBasicFoldersTimestamp(timestamp: Timestamp): Promise<Result<void>> {
        try {
            await this.knex('basic_folders_timestamp').insert({ timestamp });
            return Result.Ok();
        } catch (error) {
            this.logger.error('Error saving basic folders timestamp', error);
            return Result.fail('DatabaseError');
        }
    }

    async getBasicFoldersTimestamp(): Promise<Result<Timestamp | null>> {
        try {
            const timestamp = await this.knex('basic_folders_timestamp').orderBy('timestamp', 'desc').first();
            return Result.Ok(timestamp || null);
        } catch (error) {
            this.logger.error('Error fetching basic folders timestamp', error);
            return Result.fail('DatabaseError');
        }
    }
}