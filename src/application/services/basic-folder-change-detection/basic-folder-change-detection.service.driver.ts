import { BasicFoldersRepositoryTestkit } from '../../interfaces/basic-folders-repository/basic-folders-repository.interface.testkit';
import { aBasicFoldersList } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { AppLoggerServiceTestkit } from '../../../infra/logging/app-logger.service.testkit';
import { BasicFolderChangeDetectionService } from './basic-folder-change-detection.service';
import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { chance } from '../../../utils/Chance/chance';
import { Result } from 'rich-domain';

export class BasicFolderChangeDetectionServiceDriver {
    private maxRetry = chance.integer({ min: 1, max: 5 });
    private loggerTestkit = AppLoggerServiceTestkit();
    private basicFoldersRepositoryTestkit = BasicFoldersRepositoryTestkit();
    private basicFolderChangeDetectionService: BasicFolderChangeDetectionService;

    constructor() {
        this.basicFolderChangeDetectionService = new BasicFolderChangeDetectionService({
            basicFolderRepositoryInterface: this.get.basicFoldersRepository(),
            logger: this.get.logger(),
            maxRetry: this.maxRetry,
        });
    }

    given = {
        mockGetBasicFoldersIdsAndsUpdatedAt: (result: Result<{ id: string; updatedAt: Timestamp }[]>): this => {
            this.basicFoldersRepositoryTestkit.mockGetBasicFoldersIdsAndsUpdatedAt(result);
            return this;
        },
    };

    when = {
        execute: (basicFolder?: BasicFolder[]): Promise<Result<BasicFolderChange>> => {
            return this.basicFolderChangeDetectionService.execute(basicFolder || aBasicFoldersList());
        },
    };

    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
        basicFoldersRepository: () => this.basicFoldersRepositoryTestkit.basicFoldersRepository(),
    };
}
