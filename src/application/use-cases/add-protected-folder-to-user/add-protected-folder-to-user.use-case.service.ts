import { BasicFoldersRepositoryInterface } from 'src/application/interfaces/basic-folders-repository/basic-folders-repository.interface';
import { RegisteredFoldersService } from 'src/application/services/folders/registered-folders/registered-folders.service';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entites-api/romach-entities-api.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Result } from 'rich-domain';

export interface AddProtectedFolderToUserUseCaseOptions {
    logger: AppLoggerService;
    api: RomachEntitiesApiInterface;
    romachBasicFolderRepositoryInterface: BasicFoldersRepositoryInterface;
    registeredFolderService: RegisteredFoldersService;
}
export interface AddProtectedFolderToUserInput {
    upn: string;
    password?: string;
    folderId: string;
}

export class AddProtectedFolderToUserUseCase {
    constructor(private options: AddProtectedFolderToUserUseCaseOptions) {}

    async execute(input: AddProtectedFolderToUserInput): Promise<Result<void>> {
        try {
            const basicFolderResult = await this.options.romachBasicFolderRepositoryInterface.getBasicFolderById(
                input.folderId,
            );
            if (basicFolderResult.isFail()) {
                this.options.logger.error('Failed to fetch basic folder from repo by folderId', { input });
                return this.options.registeredFolderService.upsertGeneralError({
                    ...input,
                    isPasswordProtected: false,
                });
            }

            const basicFolder = basicFolderResult.value();

            return await this.handleNewFolder(input, basicFolder);
        } catch (error) {
            this.options.logger.error('Unexpected error during AddProtectedFolderToUserUseCase execution', {
                error,
                input,
            });
            return Result.fail('general-error');
        }
    }

    private async handleProtectedFolders(input: AddProtectedFolderToUserInput): Promise<Result<void>> {
        const { upn, password, folderId } = input;

        const checkPasswordResult = await this.options.api.checkPassword(folderId, password);
        if (checkPasswordResult.isFail()) {
            this.options.logger.error('Failed to check password for folder', { folderId, upn });
            return this.options.registeredFolderService.upsertGeneralError({
                upn,
                folderId,
                isPasswordProtected: true,
            });
        }

        const isPasswordCorrect = checkPasswordResult.value();
        if (!isPasswordCorrect) {
            await this.options.registeredFolderService.upsertWrongPassword(upn, folderId);
            return Result.fail();
        }

        const foldersResponse = await this.options.api.fetchFolderByIdAndPassword({ folderId, password });
        if (foldersResponse.isFail()) {
            this.options.logger.error('Failed to fetch folders from API', { folderId });
            return this.options.registeredFolderService.upsertGeneralError({
                upn,
                folderId,
                isPasswordProtected: true,
            });
        }

        const folder = foldersResponse.value();
        await this.options.registeredFolderService.upsertValid({ upn, folderId, folder, password });
        return Result.Ok();
    }

    private async handleNewFolder(
        input: AddProtectedFolderToUserInput,
        basicFolder: BasicFolder,
    ): Promise<Result<void>> {
        if (basicFolder.getProps().isPasswordProtected) {
            return this.handleProtectedFolders(input);
        }

        const { upn, folderId, password } = input;

        const foldersResponse = await this.options.api.fetchFolderByIdAndPassword({ folderId, password });
        if (foldersResponse.isFail()) {
            this.options.logger.error('Failed to fetch folders from API', { folderId });
            return this.options.registeredFolderService.upsertGeneralError({
                ...input,
                isPasswordProtected: false,
            });
        }

        const folder = foldersResponse.value();
        await this.options.registeredFolderService.upsertValid({ upn, folderId, folder });
        return Result.Ok();
    }
}
