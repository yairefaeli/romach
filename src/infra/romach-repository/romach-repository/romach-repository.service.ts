import { NullableTimestamp, RomachRepositoryInterface } from '../../../application/interfaces/romach-repository.interface';
import { FoldersByIdResponse } from '../../../application/view-model/folders-by-ids-response';
import { RegisteredFolder } from '../../../domain/entities/RegisteredFolder';
import { RealityId } from '../../../application/entities/reality-id';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';
import { Knex } from 'knex';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';

export class RomachRepositoryService implements RomachRepositoryInterface {
  constructor(
    private readonly knex: Knex,
    private readonly logger: AppLoggerService,
    private reality: RealityId,
  ) { }
  getBasicFoldersByIds(ids: string[]): Promise<Result<FoldersByIdResponse>> {
    throw new Error('Method not implemented.');
  }


  getBasicFolders(): Promise<Result<BasicFolder[]>> {
    throw new Error('Method not implemented.');
  }

  getFoldersByIds(ids: string[]): Promise<Result<FoldersByIdResponse>> {
    throw new Error('Method not implemented.');
  }



  saveBasicFoldersTimestamp(timestamp: Timestamp): Promise<Result<void>> {
    throw new Error('Method not implemented.');
  }

  getBasicFoldersTimestamp(): Promise<Result<NullableTimestamp>> {
    throw new Error('Method not implemented.');
  }

  saveBasicFolders(basicFolder: BasicFolder[]): Promise<Result<void>> {
    throw new Error('Method not implemented.');
  }

  saveBasicFoldersById(ids: string[]): Promise<Result<void>> {
    throw new Error('Method not implemented.');
  }

  deleteBasicFolderByIds(ids: string[]): Promise<Result<void[]>> {
    throw new Error('Method not implemented.');
  }

  upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>> {
    throw new Error('Method not implemented.');
  }

  getBasicFoldersIdsAndsUpdatedAt(folderIds: string[]): Promise<Result<{ id: string; updatedAt: string; }[]>> {
    throw new Error('Method not implemented.');
  }


  async saveHierarchies(hierarchy: Hierarchy[]): Promise<Result<void>> {
    this.logger.info(
      `saved ${hierarchy?.length} hierarchies to database for reality ${this.reality}`,
    );

    return Result.Ok();
  }

  async getHierarchies(): Promise<Result<Hierarchy[]>> {
    this.logger.info(
      `read hierarchies from database for reality ${this.reality}`,
    );

    return Result.Ok([]);
  }


  async getRegisteredFoldersByUpn(upn: string): Promise<Result<string[]>> {
    this.logger.info(`read registered folders for upn ${upn}`);
    return Result.Ok([]);
  }
}
