import { RomachRepositoryInterface } from '../interfaces/romach-repository.interface';
import { AppLoggerService } from '../../infra/logging/app-logger.service';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Result } from 'rich-domain';
import { differenceBy } from 'lodash';

export interface BasicFolderChange {
    inserted: BasicFolder[];
    updated: BasicFolder[];
    deleted: string[];
}

export interface BasicFolderChangeDetectionServiceOptions {
    repository: RomachRepositoryInterface;
    logger: AppLoggerService;
    pollInterval: number;
    retryInterval: number;
    maxRetry: number;
}

export class BasicFolderChangeDetectionService {
    constructor(
        private readonly repository: RomachRepositoryInterface,
        private readonly logger: AppLoggerService,

    ) { }

    // Execute method to detect changes in fetched folders
    async execute(current: BasicFolder[]): Promise<Result<BasicFolderChange>> {

        const foldersIds = current.map(folder => folder.getProps().id)

        const previousFoldersResult = await this.repository.getBasicFoldersIdsAndsUpdatedAt(foldersIds);

        if (previousFoldersResult.isFail()) {
            return Result.fail()
        }

        const previousFoldersIdsAndUpdatedAt = previousFoldersResult.value();

        const deleted = current.filter(folder => folder.getProps().deleted).map(folder => folder.getProps().id);

        const updated = differenceBy(current, previousFoldersIdsAndUpdatedAt, 'id', 'updatedAt');

        const inserted = differenceBy(current, [...deleted, ...updated], 'id');



        return Result.Ok({
            inserted,
            deleted,
            updated
        })

    }
}
