import { BasicFoldersRepositoryInterface } from 'src/application/interfaces/basic-folders-repository/basic-folders-repository.interface';
import { RegisteredFoldersService } from 'src/application/services/folders/registered-folders/registered-folders.service';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entites-api/romach-entities-api.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { catchError, switchMap } from 'rxjs/operators';
import { Result } from 'rich-domain';
import { from, of } from 'rxjs';

export interface AddProtectedFolderToUserInput {
    upn: string;
    password?: string;
    folderId: string;
}

export interface AddProtectedFolderToUserUseCaseOptions {
    logger: AppLoggerService;
    api: RomachEntitiesApiInterface;
    romachBasicFolderRepositoryInterface: BasicFoldersRepositoryInterface;
    registeredFolderService: RegisteredFoldersService;
}

export class AddProtectedFolderToUserUseCase {
    constructor(private readonly options: AddProtectedFolderToUserUseCaseOptions) {}

    execute(input: AddProtectedFolderToUserInput) {
        return from(this.options.romachBasicFolderRepositoryInterface.getBasicFolderById(input.folderId)).pipe(
            switchMap((basicFolderResult) => {
                if (basicFolderResult.isFail()) {
                    this.options.logger.error('Failed to fetch basic folder from repo by folderId', { input });
                    return this.options.registeredFolderService.upsertGeneralError({
                        ...input,
                        isPasswordProtected: false,
                    });
                }

                const basicFolder = basicFolderResult.value();
                return this.handleNewFolder(input, basicFolder);
            }),
            catchError((error) => {
                this.options.logger.error('Unexpected error during AddProtectedFolderToUserUseCase execution', {
                    error,
                    input,
                });
                return of(Result.fail('general-error'));
            }),
        );
    }

    private handleNewFolder(input: AddProtectedFolderToUserInput, basicFolder: BasicFolder) {
        if (basicFolder.getProps().isPasswordProtected) {
            return this.handleProtectedFolders(input);
        }

        const { upn, folderId, password } = input;

        return from(this.options.api.fetchFolderByIdAndPassword({ folderId, password })).pipe(
            switchMap((foldersResponse) => {
                if (foldersResponse.isFail()) {
                    this.options.logger.error('Failed to fetch folders from API', { folderId });
                    return this.options.registeredFolderService.upsertGeneralError({
                        ...input,
                        isPasswordProtected: false,
                    });
                }

                const folder = foldersResponse.value();
                return this.options.registeredFolderService.upsertValid({ upn, folderId, folder });
            }),
        );
    }

    private handleProtectedFolders(input: AddProtectedFolderToUserInput) {
        const { upn, password, folderId } = input;

        return from(this.options.api.checkPassword(folderId, password)).pipe(
            switchMap((checkPasswordResult) => {
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
                    return this.options.registeredFolderService.upsertWrongPassword(upn, folderId);
                }

                return from(this.options.api.fetchFolderByIdAndPassword({ folderId, password })).pipe(
                    switchMap((foldersResponse) => {
                        if (foldersResponse.isFail()) {
                            this.options.logger.error('Failed to fetch folders from API', { folderId });
                            return this.options.registeredFolderService.upsertGeneralError({
                                upn,
                                folderId,
                                isPasswordProtected: true,
                            });
                        }

                        const folder = foldersResponse.value();
                        return this.options.registeredFolderService.upsertValid({ upn, folderId, folder, password });
                    }),
                );
            }),
        );
    }
}
