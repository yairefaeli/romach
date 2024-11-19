import { Knex } from "knex";
import { Result } from "rich-domain";
import { RealityId } from "src/application/entities/reality-id";
import { NullableTimestamp, RomachRepositoryInterface } from "src/application/interfaces/romach-repository.interface";
import { FoldersByIdResponse, FoldersIdsAndsUpdatedAt } from "src/application/view-model/folders-by-ids-response";
import { BasicFolder } from "src/domain/entities/BasicFolder";
import { Hierarchy } from "src/domain/entities/Hierarchy";
import { RegisteredFolder } from "src/domain/entities/RegisteredFolder";
import { Timestamp } from "src/domain/entities/Timestamp";
import { UPN } from "src/domain/entities/UPN";
import { AppLoggerService } from "src/infra/logging/app-logger.service";

export class RomachRepositoryService implements RomachRepositoryInterface {
  constructor(
    private readonly knex: Knex,
    private readonly logger: AppLoggerService,
    private reality: RealityId,
  ) { }


  async getBasicFoldersByIds(ids: string[]): Promise<Result<FoldersByIdResponse>> {
    try {
      const folders = await this.knex<FoldersByIdResponse>('basic_folders')
        .whereIn('id', ids);
      Result.Ok(folders);
    } catch (error) {
      this.logger.error('Error fetching folders by IDs');
      return Result.fail('DatabaseError');
    }
  }

  async getBasicFolders(): Promise<Result<BasicFolder[]>> {
    try {
      const folders = await this.knex<BasicFolder>('basic_folders')
        .select('*');
      return Result.Ok(folders);
    } catch (error) {
      this.logger.error('Error fetching basic folders');
      return Result.fail('DatabaseError');
    }
  }

  async getFoldersByIds(ids: string[]): Promise<Result<FoldersByIdResponse>> {
    try {
      const folders = await this.knex<RegisteredFolder>('registered_folders')
        .whereIn('id', ids)
        .select('*');
      Result.Ok(folders);
    } catch (error) {
      this.logger.error('Error fetching folders by IDs');
      return Result.fail('DatabaseError');
    }
  }

  async saveBasicFolders(basicFolders: BasicFolder[]): Promise<Result<void>> {
    try {
      await this.knex<BasicFolder>('basic_folders')
        .insert(basicFolders);
      return Result.Ok();
    } catch (error) {
      this.logger.error('Error saving basic folders');
      return Result.fail('DatabaseError');
    }
  }

  async deleteBasicFolderByIds(ids: string[]): Promise<Result<void[]>> {
    try {
      await this.knex('basic_folders')
        .whereIn('id', ids)
        .del();
      Result.Ok();
    } catch (error) {
      this.logger.error('Error deleting folders by ID');
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


  async getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]): Promise<Result<FoldersIdsAndsUpdatedAt[]>> {
    try {
      const folders = await this.knex('basic_folders')
        .whereIn('id', folderIds)
        .select('id', 'updated_at as updatedAt');
      return Result.Ok(folders);
    } catch (error) {
      this.logger.error('Error fetching folder IDs and updatedAt');
      return Result.fail('DatabaseError');
    }
  }


  async saveHierarchies(hierarchy: Hierarchy[]): Promise<Result<void>> {
    try {
      await this.knex('hierarchy')
        .insert(hierarchy)
        .onConflict('id')
        .merge();
      this.logger.info(`Saved ${hierarchy} hierarchies to database for reality ${this.reality}`);
      return Result.Ok();
    } catch (error) {
      this.logger.error('Error saving hierarchies');
      return Result.fail('DatabaseError');
    }
  }


  async getHierarchies(): Promise<Result<Hierarchy[]>> {
    try {
      const hierarchies = await this.knex<Hierarchy>('hierarchy')
        .where('') // make sure need 'where' clause
        .select('*');
      this.logger.info(`Read ${hierarchies.length} hierarchies from database for reality ${this.reality}`);
    } catch (error) {
      this.logger.error('Error fetching hierarchies');
      return Result.fail('DatabaseError');
    }
  }



  async getRegisteredFoldersByUpn(upn: UPN): Promise<Result<RegisteredFolder[]>> {
    try {
      const folders = await this.knex('registered_folders')
        .where({ upn })
        .pluck('folder_id');

      this.logger.info(`Read ${folders.length} registered folders for upn ${upn}`);
      return Result.Ok(folders);
    } catch (error) {
      this.logger.error('Error fetching registered folders by UPN');
      return Result.fail('DatabaseError');
    }
  }

  async saveBasicFoldersTimestamp(timestamp: Timestamp): Promise<Result<void>> {
    try {
      await this.knex('basic_folders_timestamp')
        .insert({ timestamp });
      return Result.Ok();
    } catch (error) {
      this.logger.error('Error saving basic folders timestamp');
      return Result.fail('DatabaseError');
    }
  }

  async getBasicFoldersTimestamp(): Promise<Result<NullableTimestamp>> {
    try {
      const timestamp = await this.knex<NullableTimestamp>('basic_folders_timestamp')
        .orderBy('timestamp', 'desc')
        .first();
      return Result.Ok(timestamp || null);
    } catch (error) {
      this.logger.error('Error fetching basic folders timestamp');
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
      return Result.fail('DatabaseError');
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

  async deleteRegisteredFoldersByIds(ids: string[]): Promise<Result<void>> {
    try {
      await this.knex('registered_folders')
        .whereIn('id', ids)
        .del();
      return Result.Ok();
    } catch (error) {
      this.logger.error('Error deleting registered folders by IDs');
      return Result.fail('DatabaseError');
    }
  }
}
