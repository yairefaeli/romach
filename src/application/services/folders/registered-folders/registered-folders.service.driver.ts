import { RegisteredFolderRepositoryTestkit } from '../../../interfaces/registered-folders-repository/registered-folder-repository.interface.testkit';
import { RegisteredFolder, RegisteredFolderProps } from '../../../../domain/entities/RegisteredFolder';
import { AppLoggerServiceTestkit } from '../../../../infra/logging/app-logger.service.testkit';
import { RegisteredFoldersService } from './registered-folders.service';
import { chance } from '../../../../utils/Chance/chance';
import { Result } from 'rich-domain';

export class RegisteredFoldersServiceDriver {
    private loggerTestkit = AppLoggerServiceTestkit();
    private registeredFoldersService: RegisteredFoldersService;
    private registeredFolderRepositoryTestkit = RegisteredFolderRepositoryTestkit();
    private createGeneralErrorFolderSpy = jest.spyOn(RegisteredFolder, 'createGeneralErrorRegisteredFolder');

    constructor() {
        this.registeredFoldersService = new RegisteredFoldersService({
            logger: this.get.logger(),
            registeredFoldersRepository: this.get.registeredFoldersRepository(),
        });
    }

    given = {
        createGeneralErrorFolderResult: (result: Result<RegisteredFolder>): this => {
            this.createGeneralErrorFolderSpy.mockReturnValue(result);
            return this;
        },
        upsertRegisteredFolderResult: (result: Result): this => {
            this.registeredFolderRepositoryTestkit.mockUpsertRegisteredFolder(result);
            return this;
        },
    };

    when = {
        upsertGeneralError: ({
            upn = chance.upn(),
            folderId = chance.guid(),
            password = chance.string(),
            isPasswordProtected = chance.bool(),
        }: Partial<Pick<RegisteredFolderProps, 'upn' | 'password' | 'folderId' | 'isPasswordProtected'>> = {}) =>
            this.registeredFoldersService.upsertGeneralError({ upn, password, folderId, isPasswordProtected }),
    };

    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
        registeredFoldersRepository: () => this.registeredFolderRepositoryTestkit.registeredFolderRepository(),
    };
}
