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

export class AddProtectedFolderToUserUseCase {
    constructor(
        private readonly logger: AppLoggerService,
        private romachBasicFolderRepositoryInterface: BasicFoldersRepositoryInterface,
        private api: RomachEntitiesApiInterface,
        private registeredFolderService: RegisteredFoldersService,
    ) {}

    execute(input: AddProtectedFolderToUserInput) {
        const { upn, folderId } = input;

        return from(this.romachBasicFolderRepositoryInterface.getBasicFolderById(folderId)).pipe(
            switchMap((basicFolderResult) => {
                if (basicFolderResult.isFail()) {
                    this.logger.error('Failed to fetch basic folder from repo by folderId', { input });
                    return this.registeredFolderService.upsertGeneralError(upn, folderId, false);
                }

                const basicFolder = basicFolderResult.value();
                return this.handleNewFolder(input, basicFolder);
            }),
            catchError((error) => {
                this.logger.error('Unexpected error during AddProtectedFolderToUserUseCase execution', {
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

        return from(this.api.fetchFolderByIdAndPassword({ folderId, password })).pipe(
            switchMap((foldersResponse) => {
                if (foldersResponse.isFail()) {
                    this.logger.error('Failed to fetch folders from API', { folderId });
                    return this.registeredFolderService.upsertGeneralError(upn, folderId, false);
                }

                const folder = foldersResponse.value();
                return this.registeredFolderService.upsertValid(upn, folderId, folder);
            }),
        );
    }

    private handleProtectedFolders(input: AddProtectedFolderToUserInput) {
        const { upn, password, folderId } = input;

        return from(this.api.checkPassword(folderId, password)).pipe(
            switchMap((checkPasswordResult) => {
                if (checkPasswordResult.isFail()) {
                    this.logger.error('Failed to check password for folder', { folderId, upn });
                    return this.registeredFolderService.upsertGeneralError(upn, folderId, true);
                }

                const isPasswordCorrect = checkPasswordResult.value();
                if (!isPasswordCorrect) {
                    return this.registeredFolderService.upsertWrongPassword(upn, folderId);
                }

                return from(this.api.fetchFolderByIdAndPassword({ folderId, password })).pipe(
                    switchMap((foldersResponse) => {
                        if (foldersResponse.isFail()) {
                            this.logger.error('Failed to fetch folders from API', { folderId });
                            return this.registeredFolderService.upsertGeneralError(upn, folderId, true);
                        }

                        const folder = foldersResponse.value();
                        return this.registeredFolderService.upsertValid(upn, folderId, folder, password);
                    }),
                );
            }),
        );
    }
}
