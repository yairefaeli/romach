import { RegisteredFolderRepositoryTestkit } from '../../../interfaces/registered-folders-repository/registered-folder-repository.interface.testkit';
import { AppLoggerServiceTestkit } from '../../../../infra/logging/app-logger.service.testkit';
import { RegisteredFolderProps } from '../../../../domain/entities/RegisteredFolder';
import { RegisteredFoldersService } from './registered-folders.service';
import { chance } from '../../../../utils/Chance/chance';

export class RegisteredFoldersServiceDriver {
    private loggerTestkit = AppLoggerServiceTestkit();
    private registeredFoldersService: RegisteredFoldersService;
    private registeredFolderRepositoryTestkit = RegisteredFolderRepositoryTestkit();

    constructor() {
        this.registeredFoldersService = new RegisteredFoldersService({
            logger: this.get.logger(),
            registeredFoldersRepository: this.get.registeredFoldersRepository(),
        });
    }

    when = {
        upsertGeneralError: ({
            upn = chance.string(),
            folderId = chance.guid(),
            isPasswordProtected = chance.bool(),
        }: Partial<Pick<RegisteredFolderProps, 'upn' | 'folderId' | 'isPasswordProtected'>> = {}) =>
            this.registeredFoldersService.upsertGeneralError({ upn, folderId, isPasswordProtected }),
    };

    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
        registeredFoldersRepository: () => this.registeredFolderRepositoryTestkit.registeredFolderRepository(),
    };
}
