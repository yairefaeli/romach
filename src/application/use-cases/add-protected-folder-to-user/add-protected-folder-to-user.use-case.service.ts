import { RegisteredFolderErrorStatus } from '../../../domain/entities/RegisteredFolderStatus';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { FoldersService } from 'src/application/services/folders/folders.service';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Folder } from '../../../domain/entities/Folder';
import { Result } from 'rich-domain';

export interface AddProtectedFolderToUserInput {
    // not only protected
    upn: string;
    password?: string;
    folderId: string;
}

export class AddProtectedFolderToUserUseCase {
    constructor(
        private readonly logger: AppLoggerService,
        private repository: RomachRepositoryInterface,
        private api: RomachEntitiesApiInterface,
        private registeredFolderService: FoldersService,
    ) { }

    async execute(input: AddProtectedFolderToUserInput): Promise<Result<Folder | void, RegisteredFolderErrorStatus>> {
        const { upn, folderId } = input;
        const basicfolderResult = await this.repository.getBasicFolderById(folderId);
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
            return this.handleProtectedFolders(input, basicFolder);
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
        basicFolder: BasicFolder,
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

/*
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

    #PSUDO:
     - user requested new folder (upn, id, password)
            select basicFolder from repo by folderId
            on sucess
                if passwordProtected
                    check with API by password and folderId
                    on sucess
                        on right password
                            fetch folder from API with id and password
                            get current registeredFolders from repo by folderId, password
                            create registeredFolder with status 'valid' - on create fail 'error'
                            update current registeredFolders status and folder
                            upsert all registeredFolders to repo
                        on wrong password
                            get current registeredFolders from repo by folderId, password
                            create registeredFolder with status 'wrong-password'
                            update current registeredFolders status
                            upsert all registeredFolders to repo
                    on fail
                        get current registeredFolders from repo by folderId
                        create new registeredFolder with status 'error'
                        update current registeredFolders status
                        upsert all registeredFolders to repo
                if not passwordProtected
                    fetch folder from API with id
                    get current registeredFolders from repo by folderId
                    create new registeredFolder with status 'valid' - on create fail 'error'
                    update current registeredFolders status and folder
                    upsert all registeredFolders to repo
            on failed
                create registeredFolder with status 'error'
                insert registeredFolder to repo



            updateregisteredFolders(upn, id, password, status, folder):
                get current registeredFolders from repo by folderId
                create new registeredFolder with status 'status'
                update current registeredFolders status 'status' and folder
                upsert all registeredFolders to repo
    */

// const { upn, password, folderId } = input;
// const checkPasswordResult = await this.api.checkPassword(folderId, password);

// if (checkPasswordResult.isFail()) {
//     Result.fail(checkPasswordResult.error());
// }

// const isPasswordCorrect = checkPasswordResult.value();

// if (!isPasswordCorrect) {
//     Result.fail('wrong-password');
// }

// const folderResult = await this.api.getFolderByIdWithPassword(folderId, password);

// if (folderResult.isFail()) {
//     return Result.fail('not-found');
// }

// const folder = folderResult.value();
// const createValidRegisteredFolderResult = RegisteredFolder.createValidRegisteredFolder({
//     folder,
//     upn,
//     lastValidPasswordTimestamp: Timestamp.now(),
//     password,
// });

// if (createValidRegisteredFolderResult.isFail()) {
//     return Result.fail('general-error');
// }

// const upsertRegisteredFoldersResult = await this.repo.upsertRegisteredFolders([
//     createValidRegisteredFolderResult.value(),
// ]);

// if (upsertRegisteredFoldersResult.isFail()) {
//     return Result.fail('general-error');
// }

// return Result.Ok(folder);
