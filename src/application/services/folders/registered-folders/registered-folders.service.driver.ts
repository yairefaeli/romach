import { RegisteredFolderRepositoryTestkit } from '../../../interfaces/registered-folders-repository/registered-folder-repository.interface.testkit';
import { aGeneralErrorRegisteredFolder } from '../../../../utils/builders/RegisteredFolder/general-error-registered-folder.builder';
import { aValidRegisteredFolder } from '../../../../utils/builders/RegisteredFolder/valid-registered-folder.builder';
import { RegisteredFolder, RegisteredFolderProps } from '../../../../domain/entities/RegisteredFolder';
import { AppLoggerServiceTestkit } from '../../../../infra/logging/app-logger.service.testkit';
import { aFolder } from '../../../../utils/builders/Folder/folder.builder';
import { RegisteredFoldersService } from './registered-folders.service';
import { chance } from '../../../../utils/Chance/chance';
import { Result } from 'rich-domain';

export class RegisteredFoldersServiceDriver {
    private loggerTestkit = AppLoggerServiceTestkit();
    private registeredFoldersService: RegisteredFoldersService;
    private registeredFolderRepositoryTestkit = RegisteredFolderRepositoryTestkit();
    private createGeneralErrorFolderSpy = jest
        .spyOn(RegisteredFolder, 'createGeneralErrorRegisteredFolder')
        .mockReturnValue(Result.Ok(aGeneralErrorRegisteredFolder()));
    private createValidRegisteredFolderSpy = jest
        .spyOn(RegisteredFolder, 'createValidRegisteredFolder')
        .mockReturnValue(Result.Ok(aValidRegisteredFolder()));

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
        createValidRegisteredFolderResult: (result: Result<RegisteredFolder>): this => {
            this.createValidRegisteredFolderSpy.mockReturnValue(result);
            return this;
        },
        upsertRegisteredFolderResult: (result: Result): this => {
            this.registeredFolderRepositoryTestkit.mockUpsertRegisteredFolder(result);
            return this;
        },
        getRegisteredFoldersByIdAndPasswordResult: (result: Result<RegisteredFolder[]>): this => {
            this.registeredFolderRepositoryTestkit.mockGetRegisteredFoldersByIdAndPassword(result);
            return this;
        },
    };

    when = {
        upsertGeneralError: ({
            upn = 'chance.upn()',
            folderId = chance.guid(),
            password = chance.string(),
            isPasswordProtected = chance.bool(),
        }: Partial<Pick<RegisteredFolderProps, 'upn' | 'password' | 'folderId' | 'isPasswordProtected'>> = {}) =>
            this.registeredFoldersService.upsertGeneralError({ upn, password, folderId, isPasswordProtected }),
        upsertValid: ({
            upn = 'chance.upn()',
            folder = aFolder(),
            folderId = chance.string(),
            password = chance.string(),
        }: Partial<Pick<RegisteredFolderProps, 'upn' | 'folder' | 'password' | 'folderId'>> = {}) =>
            this.registeredFoldersService.upsertValid({ upn, folderId, folder, password }),
    };

    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
        registeredFoldersRepository: () => this.registeredFolderRepositoryTestkit.registeredFolderRepository(),
    };
}
