import {
    AddProtectedFolderToUserUseCase,
    AddProtectedFolderToUserUseCaseOptions,
} from './add-protected-folder-to-user.use-case.service';
import { BasicFoldersRepositoryTestkit } from '../../interfaces/basic-folders-repository/basic-folders-repository.interface.testkit';
import { RegisteredFoldersServiceTestkit } from '../../services/folders/registered-folders/registered-folders.service.testkit';
import { RomachEntitiesApiTestkit } from '../../interfaces/romach-entites-api/romach-entities-api.interface.testkit';
import { AppLoggerServiceTestkit } from '../../../infra/logging/app-logger.service.testkit';
import { FolderErrorStatus } from '../../../domain/entities/ProtectedFolderStatus';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Folder } from '../../../domain/entities/folder';
import { Result } from 'rich-domain';

export class AddProtectedFolderToUserUseCaseDriver {
    private useCase: AddProtectedFolderToUserUseCase;
    private basicFolderRepositoryTestkit = BasicFoldersRepositoryTestkit();
    private registeredFolderServiceTestkit = RegisteredFoldersServiceTestkit();
    private loggerTestkit = AppLoggerServiceTestkit();
    private apiTestkit = RomachEntitiesApiTestkit();

    constructor() {
        const options: AddProtectedFolderToUserUseCaseOptions = {
            logger: this.loggerTestkit.appLoggerService(),
            api: this.apiTestkit.romachEntitiesApiInterface(),
            romachBasicFolderRepositoryInterface: this.basicFolderRepositoryTestkit.basicFoldersRepository(),
            registeredFolderService: this.registeredFolderServiceTestkit.service(),
        };
        this.useCase = new AddProtectedFolderToUserUseCase(options);
    }

    given = {
        basicFolderFetched: (result: Result<BasicFolder>): this => {
            this.basicFolderRepositoryTestkit.mockGetBasicFolderById(result);
            return this;
        },
        passwordCheck: (result: Promise<Result<boolean>>): this => {
            this.apiTestkit.mockCheckPassword(result);
            return this;
        },
        folderFetched: (result: Promise<Result<Folder, FolderErrorStatus>>): this => {
            this.apiTestkit.mockFetchFolderByIdAndPassword(result);
            return this;
        },
    };

    when = {
        execute: async (input) => {
            return await this.useCase.execute(input);
        },
    };

    get = {
        logger: () => this.loggerTestkit,
        registeredFolderService: () => this.registeredFolderServiceTestkit,
        api: () => this.apiTestkit.romachEntitiesApiInterface(),
        basicFolderRepository: () => this.basicFolderRepositoryTestkit.basicFoldersRepository(),
    };
}
