import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { FoldersByIdResponse } from 'src/application/view-model/folders-by-ids-response';
import { RegisteredFolderStatus } from 'src/domain/entities/RegisteredFolderStatus';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/Folder';
import { FoldersService } from './folders.service';
import { Result } from 'rich-domain';

export class RequsetNewFolderService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly folderService: FoldersService,
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly repository: RomachRepositoryInterface,
    ) {}

    async execute(upn: string, folderId: string, password?: string): Promise<Result<void>> {
        const basicfolderResult = await this.repository.getBasicFolderById(folderId);
        if (basicfolderResult.isFail()) {
            this.logger.error('failed to fetch basicFolders from repo by folderId', {
                folderId,
            });
            return Result.fail();
        }

        const basicFolder = basicfolderResult.value();
        const result = await this.handleNewFolder(basicFolder, upn, folderId, password);
        if (result.isFail()) {
            return await this.handleNewFolderWithError(upn, folderId);
        }
    }

    private async handleNewFolderWithError(upn: string, folderId: string) {
        const newregisteredFolderResult = RegisteredFolder.createGeneralErrorRegisteredFolder({
            upn,
            folderId,
            isPasswordProtected: false,
            lastValidPasswordTimestamp: null,
        });
        if (newregisteredFolderResult.isFail()) {
            this.logger.error('failed to create new registeredFolder');
            return Result.fail();
        }

        const newregisteredFolder = newregisteredFolderResult.value();
        const upsertFolderResult = await this.repository.upsertRegisteredFolder(newregisteredFolder);
        if (upsertFolderResult.isFail()) {
            this.logger.error('failed to upsert registeredFolder to repo');
            return Result.fail();
        }
        return Result.Ok();
    }

    private handleNewFolder(basicFolder: BasicFolder, upn: string, folderId: string, password?: string) {
        if (basicFolder.getProps().isPasswordProtected) {
            return this.handleProtectedFolders(upn, folderId, password);
        } else {
            return this.handleUnprotectedFolders(upn, folderId);
        }
    }

    private async handleProtectedFolders(upn: string, folderId: string, password?: string) {
        const checkPasswordResult = await this.romachApi.checkPassword(folderId, password);
        if (checkPasswordResult.isOk()) {
            const isPasswordCorrect = checkPasswordResult.value();
            if (isPasswordCorrect) {
                return this.handleCorrectPassword(upn, folderId, password);
            } else {
                return this.handleWrongPassword(upn, folderId);
            }
        } else {
            return this.checkPasswordFailed(upn, folderId);
        }
    }

    private async checkPasswordFailed(upn: string, folderId: string, password?: string) {
        this.logger.error('failed to check password for folder');
        return this.handleNewFolderWithError(upn, folderId);
    }

    private async handleCorrectPassword(upn: string, folderId: string, password: string) {
        const registeredFoldersResult = await this.repository.getRegisteredFoldersByIdAndPassword(folderId, password);
        const currentregisteredFolders = registeredFoldersResult.value();
        if (!currentregisteredFolders)
            return Result.fail('failed to get registeredFolders with same folderId and password');

        const foldersResponse = await this.romachApi.getFolderByIdWithPassword(folderId, password);
        if (foldersResponse.isFail()) {
            this.logger.error('failed to fetch folders from API');
            return Result.fail();
        }

        const folder = foldersResponse.value();
        const changedValidregisteredFoldersResult = this.folderService.updateFolderToRegisteredFolders(
            currentregisteredFolders,
            folder,
        );
        if (changedValidregisteredFoldersResult.isFail()) {
            this.logger.error('failed to update registeredFolders');
            return Result.fail();
        }

        const newregisteredFolderResult = RegisteredFolder.createValidRegisteredFolder({
            upn,
            folder,
            password,
            lastValidPasswordTimestamp: Timestamp.now(),
        });
        if (newregisteredFolderResult.isFail()) {
            this.logger.error('failed to create new registeredFolder');
            return Result.fail();
        }

        const newregisteredFolder = newregisteredFolderResult.value();
        const updatedRegisteredFolders = changedValidregisteredFoldersResult.value();
        if (updatedRegisteredFolders) {
            const upsertFolderResult = await this.repository.upsertRegisteredFolders([
                newregisteredFolder,
                ...updatedRegisteredFolders,
            ]);
            if (upsertFolderResult.isFail()) {
                this.logger.error('failed to upsert registeredFolder to repo');
                return Result.fail();
            }
        }
    }

    private async handleWrongPassword(upn: string, folderId: string) {
        const currentregisteredFoldersResult = await this.repository.getRegisteredFoldersById(folderId);
        const currentregisteredfolders = currentregisteredFoldersResult.value();
        if (!currentregisteredfolders) return Result.fail(currentregisteredFoldersResult.error()); //registeredFoldersResult ?? - i could heap up logs

        const newregisteredFolderResult = RegisteredFolder.createWrongPasswordRegisteredFolder({
            upn,
            folderId,
        });
        const newregisteredFolder = newregisteredFolderResult.value();
        if (!newregisteredFolder) return Result.fail('failed to create new registeredFolder');

        const changedregisteredFoldersResult = this.changeStatusToregisteredFolders(
            currentregisteredfolders,
            'wrong-password',
        );
        const changedregisteredFolders = changedregisteredFoldersResult.value();
        if (!changedregisteredFolders) return Result.fail(changedregisteredFoldersResult.error());

        const allregisteredFoldersToUpsert = [...changedregisteredFolders, newregisteredFolder];
        const upsertFolderResult = await this.repository.upsertRegisteredFolders(allregisteredFoldersToUpsert);
        if (upsertFolderResult.isFail()) {
            this.logger.error('failed to upsert registeredFolder to repo');
            return Result.fail();
        }
    }

    private async handleUnprotectedFolders(upn: string, folderId: string) {
        const folderResult = await this.romachApi.getFolderByIdWithoutPassword(folderId);
        if (folderResult.isFail()) {
            this.logger.error('failed to fetch folder from API by id', { folderId });
            return Result.fail();
        }

        const folder = folderResult.value();
        const newregisteredFolderResult = RegisteredFolder.createValidRegisteredFolder({
            upn,
            folder,
            password: '',
            lastValidPasswordTimestamp: null,
        });

        const registeredFoldersResult = await this.repository.getRegisteredFoldersById(folderId);
        if (registeredFoldersResult.isFail()) {
            this.logger.error('failed to get registeredFolders with same folderId', {
                folderId,
            });
            return Result.fail();
        }

        const upsertFolderResult = await this.repository.upsertRegisteredFolders([
            newregisteredFolderResult.value(),
            ...registeredFoldersResult.value(),
        ]);
        if (upsertFolderResult.isFail()) {
            this.logger.error('failed to upsert registeredFolders to repo');
            return Result.fail();
        }
    }

    private changeStatusToregisteredFolders(registeredFolders: RegisteredFolder[], newStatus: RegisteredFolderStatus) {
        const createregisteredFolder = RegisteredFolder.getCreateFunctionByStatus(newStatus);

        const createregisteredfoldersResult = registeredFolders.map((registeredFolder) =>
            createregisteredFolder({
                ...registeredFolder.getProps(),
                lastValidPasswordTimestamp: newStatus === 'valid' ? Timestamp.now() : null,
            }),
        );

        if (Result.combine(createregisteredfoldersResult).isFail()) {
            this.logger.error('failed to change status to registeredFolders');
            return Result.fail();
        }

        return Result.Ok(createregisteredfoldersResult.map((x) => x.value()));
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
