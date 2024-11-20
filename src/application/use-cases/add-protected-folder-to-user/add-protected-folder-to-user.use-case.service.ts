import { RegisteredFolderErrorStatus } from '../../../domain/entities/RegisteredFolderStatus';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Folder } from '../../../domain/entities/Folder';
import { Result } from 'rich-domain';
import { BasicFoldersRepositoryInterface } from 'src/application/interfaces/basic-folder-interface';
import { RegisteredFoldersService } from 'src/application/services/folders/registered-folders.service';

export interface AddProtectedFolderToUserInput {
    upn: string;
    password?: string;
    folderId: string;
}

export class AddProtectedFolderToUserUseCase {
    constructor(
        private readonly logger: AppLoggerService,
        private romachBasicFolderRepositoryInterface: BasicFoldersRepositoryInterface,
        private api: RomachEntitiesApiInterface,
        private registeredFolderService: RegisteredFoldersService,
    ) { }

    async execute(input: AddProtectedFolderToUserInput): Promise<Result<Folder | void, RegisteredFolderErrorStatus>> {
        const { upn, folderId } = input;
        const basicfolderResult = await this.romachBasicFolderRepositoryInterface.getBasicFolderById(folderId);
        if (basicfolderResult.isFail()) {
            this.logger.error('failed to fetch basicFolders from repo by folderId', input);
            return Result.fail();
        }

        const basicFolder = basicfolderResult.value();
        const { isPasswordProtected } = basicFolder.getProps();
        const result = await this.handleNewFolder(input, basicFolder);
        if (result.isFail()) {
            this.logger.error('failed to fetch basicFolders from repo by folderId', input);
            return this.registeredFolderService.upsertGeneralError(upn, folderId, isPasswordProtected);
        }
    }

    async handleNewFolder(
        input: AddProtectedFolderToUserInput,
        basicFolder: BasicFolder,
    ): Promise<Result<Folder | void, RegisteredFolderErrorStatus>> {
        if (basicFolder.getProps().isPasswordProtected) {
            return this.handleProtectedFolders(input);
        }

        const { upn, folderId, password } = input;
        const foldersResponse = await this.api.fetchFolderByIdAndPassword({ folderId, password });
        if (foldersResponse.isFail()) {
            this.logger.error('failed to fetch folders from API');
            return this.registeredFolderService.upsertGeneralError(upn, folderId, false);
        }

        const folder = foldersResponse.value();
        return this.registeredFolderService.upsertValid(upn, folderId, folder);
    }

    private async handleProtectedFolders(
        input: AddProtectedFolderToUserInput,
    ): Promise<Result<Folder | void, RegisteredFolderErrorStatus>> {
        const { upn, password, folderId } = input;

        const checkPasswordResult = await this.api.checkPassword(folderId, password);
        if (checkPasswordResult.isFail()) {
            this.logger.error('Failed to check password for folder', input);
            return this.registeredFolderService.upsertGeneralError(upn, folderId, true);
        }

        const isPasswordCorrect = checkPasswordResult.value();
        if (!isPasswordCorrect) {
            return this.registeredFolderService.upsertWrongPassword(upn, folderId);
        }

        const foldersResponse = await this.api.fetchFolderByIdAndPassword({ folderId, password });
        if (foldersResponse.isFail()) {
            this.logger.error('failed to fetch folders from API');
            return this.registeredFolderService.upsertGeneralError(upn, folderId, true);
        }

        const folder = foldersResponse.value();
        return this.registeredFolderService.upsertValid(upn, folderId, folder, password);
    }
}
