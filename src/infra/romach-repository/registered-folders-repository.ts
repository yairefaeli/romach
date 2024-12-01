import { RegisteredFolderRepositoryInterface } from 'src/application/interfaces/registered-folders-repository/registered-folder-repository.interface';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Result } from 'rich-domain';
import { Knex } from 'knex';

export class RegisteredFoldersRepository implements RegisteredFolderRepositoryInterface {
    constructor(
        private readonly knex: Knex,
        private readonly logger: AppLoggerService,
    ) {}

    async getRegisteredFoldersByIdAndPassword(folderId: string, password: string): Promise<Result<RegisteredFolder[]>> {
        try {
            const folders = await this.knex<RegisteredFolder>('registered_folders')
                .where('id', folderId)
                .andWhere('password', password);
            return Result.Ok(folders);
        } catch (error) {
            this.logger.error(`Error fetching registered folders by ID and password: ${folderId}`, error);
            return Result.fail('DatabaseError');
        }
    }

    async getExpiredRegisteredFolders(): Promise<Result<RegisteredFolder[]>> {
        try {
            const folders = await this.knex<RegisteredFolder>('registered_folders')
                .where(function () {
                    // Check if `registration_timestamp` is older than 60 seconds
                    this.where('registration_timestamp', '<', this.client.raw('NOW() - INTERVAL 60 SECOND'))
                        // OR if `valid_password_timestamp` is older than 24 hours
                        .orWhere('valid_password_timestamp', '<', this.client.raw('NOW() - INTERVAL 24 HOUR'));
                })
                .select('*');

            this.logger.info(`Fetched ${folders.length} expired registered folders from repository.`);
            return Result.Ok(folders);
        } catch (error) {
            this.logger.error('Error fetching expired registered folders');
            return Result.fail(`DatabaseError: ${error}`);
        }
    }

    async getRegisteredFoldersWithFailedStatuses(): Promise<Result<RegisteredFolder[]>> {
        try {
            const folders = await this.knex<RegisteredFolder>('registered_folders')
                .whereIn('status', ['loading', 'general-error', 'not-found'])
                .select('id', 'status');

            this.logger.info(`Fetched ${folders.length} registered folders with failed statuses from repository.`);
            return Result.Ok(folders);
        } catch (error) {
            this.logger.error('Error fetching registered folders with failed statuses');
            return Result.fail('DatabaseError');
        }
    }

    async getRegisteredFoldersById(folderId: string): Promise<Result<RegisteredFolder[]>> {
        try {
            const folders = await this.knex<RegisteredFolder>('registered_folders').where('id', folderId);
            return Result.Ok(folders);
        } catch (error) {
            this.logger.error(`Error fetching registered folders by ID: ${folderId}`, error);
            return Result.fail('DatabaseError');
        }
    }

    async deleteRegisteredFoldersByIds(ids: string[]): Promise<Result<void>> {
        try {
            await this.knex('registered_folders').whereIn('id', ids).del();
            return Result.Ok();
        } catch (error) {
            this.logger.error('Error deleting registered folders by IDs', error);
            return Result.fail('DatabaseError');
        }
    }

    async getRegisteredFoldersByIds(folderIds: string[]): Promise<Result<RegisteredFolder[]>> {
        try {
            const folders = await this.knex<RegisteredFolder>('registered_folders').whereIn('id', folderIds);
            return Result.Ok(folders);
        } catch (error) {
            this.logger.error(`Error fetching registered folders by IDs: ${folderIds}`, error);
            return Result.fail('DatabaseError');
        }
    }

    async getRegisteredFoldersByUpn(upn: string): Promise<Result<RegisteredFolder[]>> {
        try {
            const folders = await this.knex<RegisteredFolder>('registered_folders').where('upn', upn);
            return Result.Ok(folders);
        } catch (error) {
            this.logger.error(`Error fetching registered folders by UPN: ${upn}`, error);
            return Result.fail('DatabaseError');
        }
    }

    async upsertRegisteredFolder(folder: RegisteredFolder): Promise<Result<void>> {
        try {
            await this.knex<RegisteredFolder>('registered_folders').insert(folder).onConflict('id').merge();
            return Result.Ok();
        } catch (error) {
            this.logger.error(`Error upserting registered folder: ${folder.getProps().folderId}`, error);
            return Result.fail('DatabaseError');
        }
    }

    async deleteRegisteredFoldersByIdsForUpn(ids: string[], upn: string): Promise<Result<void>> {
        try {
            await this.knex('registered_folders').whereIn('id', ids).andWhere('upn', upn).del();
            return Result.Ok();
        } catch (error) {
            this.logger.error(`Error deleting registered folders by IDs for UPN: ${upn}`, error);
            return Result.fail('DatabaseError');
        }
    }

    async updateRegistrationByUpnAndFolderIds(folderIds: string[], upn: string): Promise<Result<void>> {
        try {
            await this.knex('registered_folders')
                .whereIn('id', folderIds)
                .andWhere('upn', upn)
                .update({ updated_at: Timestamp.now() });
            return Result.Ok();
        } catch (error) {
            this.logger.error(`Error updating registration timestamps by folder IDs and UPN: ${upn}`, error);
            return Result.fail('DatabaseError');
        }
    }

    async upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>> {
        try {
            await this.knex('registered_folders').insert(folders).onConflict('id').merge();

            return Result.Ok();
        } catch (error) {
            this.logger.error('Error upserting registered folders');
            return Result.fail('DatabaseError');
        }
    }
}
