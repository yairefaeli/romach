import { BasicFoldersRepositoryTestkit } from '../../interfaces/basic-folders-repository/basic-folders-repository.interface.testkit';
import { AppLoggerServiceTestkit } from '../../../infra/logging/app-logger.service.testkit';
import { BasicFolderChangeDetectionService } from './basic-folder-change-detection.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { chance } from '../../../utils/Chance/chance';
import { Result } from 'rich-domain';

export class BasicFolderChangeDetectionServiceDriver {
    private loggerTestkit = AppLoggerServiceTestkit();
    private basicFoldersRepositoryTestkit = BasicFoldersRepositoryTestkit();
    private maxRetry = chance.integer({ min: 1, max: 5 });

    private service: BasicFolderChangeDetectionService;

    given = {
        basicFoldersIdsAndUpdatedAt: (result: Result<Pick<BasicFolder, 'id' | 'updatedAt'>[]>): this => {
            this.basicFoldersRepositoryTestkit.mockGetBasicFoldersIdsAndsUpdatedAt(Promise.resolve(result));
            return this;
        },
    };

    when = {
        init: (): this => {
            this.service = new BasicFolderChangeDetectionService({
                logger: this.get.logger(),
                maxRetry: this.maxRetry,
                basicFolderRepositoryInterface: this.get.basicFoldersRepository(),
            });
            return this;
        },
        execute: async (current: BasicFolder[]) => {
            return this.service.execute(current);
        },
    };

    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
        basicFoldersRepository: () => this.basicFoldersRepositoryTestkit.basicFoldersRepository(),
    };
}
