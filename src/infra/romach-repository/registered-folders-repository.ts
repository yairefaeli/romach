import { Knex } from 'knex';
import { Result } from 'rich-domain';
import { RegisteredFolderRepositoryInterface } from 'src/application/interfaces/regsitered-folder-interface';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';

export class RegisteredFoldersRepository implements RegisteredFolderRepositoryInterface {
    constructor(private readonly knex: Knex, private readonly logger: AppLoggerService) { }


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
            const folders = await this.knex<RegisteredFolder>('registered_folders')
                .where('upn', upn);
            return Result.Ok(folders);
        } catch (error) {
            this.logger.error(`Error fetching registered folders by UPN: ${upn}`, error);
            return Result.fail('DatabaseError');
        }
    }

    async upsertRegisteredFolder(folder: RegisteredFolder): Promise<Result<void>> {
        try {
            await this.knex<RegisteredFolder>('registered_folders')
                .insert(folder)
                .onConflict('id')
                .merge();
            return Result.Ok();
        } catch (error) {
            this.logger.error(`Error upserting registered folder: ${folder.getProps().folderId}`, error);
            return Result.fail('DatabaseError');
        }
    }

    async deleteRegisteredFoldersByIdsForUpn(ids: string[], upn: string): Promise<Result<void>> {
        try {
            await this.knex('registered_folders')
                .whereIn('id', ids)
                .andWhere('upn', upn)
                .del();
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
            await this.knex('registered_folders')
                .insert(folders)
                .onConflict('id')
                .merge();

            return Result.Ok();
        } catch (error) {
            this.logger.error('Error upserting registered folders');
            return Result.fail('DatabaseError');
        }
    }

}
