import { BasicFoldersRepositoryTestkit } from '../../interfaces/basic-folders-repository/basic-folders-repository.interface.testkit';
import { UpdateBasicFoldersRepositoryService } from './update-basic-folder-repository.service';
import { AppLoggerServiceTestkit } from '../../../infra/logging/app-logger.service.testkit';
import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
import { Result } from 'rich-domain';

export class UpdateBasicFoldersRepositoryServiceDriver {
    private loggerTestkit = AppLoggerServiceTestkit();
    private basicFoldersRepositoryTestkit = BasicFoldersRepositoryTestkit();
    private updateBasicFoldersRepositoryService: UpdateBasicFoldersRepositoryService;

    constructor() {
        this.updateBasicFoldersRepositoryService = new UpdateBasicFoldersRepositoryService({
            logger: this.loggerTestkit.appLoggerService(),
            basicFolderRepositoryInterface: this.basicFoldersRepositoryTestkit.basicFoldersRepository(),
        });
    }

    given = {
        mockSaveBasicFolders: (result: Result<void>): this => {
            this.basicFoldersRepositoryTestkit.mockSaveBasicFolders(result);
            return this;
        },
        mockDeleteBasicFolderByIds: (result: Result<void>): this => {
            this.basicFoldersRepositoryTestkit.mockDeleteBasicFolderByIds(result);
            return this;
        },
    };

    when = {
        execute: (changes: BasicFolderChange): Promise<Result> =>
            this.updateBasicFoldersRepositoryService.execute(changes),
    };

    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
        basicFoldersRepository: () => this.basicFoldersRepositoryTestkit,
    };
}
