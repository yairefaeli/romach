import {
    RegisterFoldersForUserInput,
    RegisterFoldersForUserOption,
    RegisterFoldersForUserUseCase,
} from './register-folders-for-user.use-case.service';
import { RegisteredFolderRepositoryTestkit } from '../../interfaces/registered-folders-repository/registered-folder-repository.interface.testkit';
import { AppLoggerServiceTestkit } from '../../../infra/logging/app-logger.service.testkit';
import { RegisteredFolder } from '../../../domain/entities/RegisteredFolder';
import { chance } from '../../../utils/Chance/chance';
import { Result } from 'rich-domain';

export class RegisterFoldersForUserUseCaseDriver {
    private useCase: RegisterFoldersForUserUseCase;
    private loggerTestkit = AppLoggerServiceTestkit();
    private repositoryTestkit = RegisteredFolderRepositoryTestkit();

    constructor(maxRetry: number = 3) {
        const options: RegisterFoldersForUserOption = {
            logger: this.loggerTestkit.appLoggerService(),
            registeredFolderRepositoryInterface: this.repositoryTestkit.registeredFolderRepository(),
            maxRetry,
        };
        this.useCase = new RegisterFoldersForUserUseCase(options);
    }

    given = {
        registeredFolders: (result: Result<RegisteredFolder[]>) => {
            this.repositoryTestkit.mockGetRegisteredFoldersByUpn(result);
            return this;
        },
        irrelevantFoldersDeleted: (result: Result<void>) => {
            this.repositoryTestkit.mockDeleteRegisteredFoldersByIdsForUpn(result);
            return this;
        },
        relevantFoldersUpdated: (result: Result<void>) => {
            this.repositoryTestkit.mockUpdateRegistrationByUpnAndFolderIds(result);
            return this;
        },
    };

    when = {
        execute: async ({
            folderIds = [],
            upn = chance.upn(),
            reality = chance.realityId(),
        }: Partial<RegisterFoldersForUserInput> = {}) => {
            return await this.useCase.execute({ upn, reality, folderIds });
        },
    };

    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
        repository: () => this.repositoryTestkit,
    };
}
