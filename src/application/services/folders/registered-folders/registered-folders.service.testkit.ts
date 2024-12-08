import { RegisteredFolderRepositoryTestkit } from '../../../interfaces/registered-folders-repository/registered-folder-repository.interface.testkit';
import { RegisteredFoldersService, RegisteredFoldersServiceOptions } from './registered-folders.service';
import { AppLoggerServiceTestkit } from '../../../../infra/logging/app-logger.service.testkit';

export const RegisteredFoldersServiceTestkit = () => {
    const loggerService = AppLoggerServiceTestkit().appLoggerService();
    const repositoryTestkit = RegisteredFolderRepositoryTestkit();
    const registeredFolderRepository = repositoryTestkit.registeredFolderRepository();

    const serviceOptions: RegisteredFoldersServiceOptions = {
        logger: loggerService,
        registeredFoldersRepository: registeredFolderRepository,
    };

    const service = new RegisteredFoldersService(serviceOptions);

    return {
        service: () => service,
        logger: loggerService,
        registeredFolderRepository,
        ...repositoryTestkit,
    };
};
