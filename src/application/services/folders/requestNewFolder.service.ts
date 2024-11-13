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
            this.logger.error('failed fetch basicFolders from repo by folderId', {
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
        const newRegisterdFolderResult = RegisteredFolder.createGeneralErrorRegisteredFolder({
            upn,
            folderId,
            isPasswordProtected: false,
            lastValidPasswordTimestamp: null,
        });
        if (newRegisterdFolderResult.isFail()) {
            this.logger.error('failed create new registerdFolder');
            return Result.fail();
        }

        const newRegisterdFolder = newRegisterdFolderResult.value();
        const upsertFolderResult = await this.repository.upsertRegisteredFolder(newRegisterdFolder);
        if (upsertFolderResult.isFail()) {
            this.logger.error('failed upsert registerdFolder to repo');
            return Result.fail();
        }
        return Result.Ok();
    }

    private handleNewFolder(basicFolder: BasicFolder, upn: string, folderId: string, password?: string) {
        if (basicFolder.getProps().isPasswordProtected) {
            return this.handlePasswordProtected(upn, folderId, password);
        } else {
            return this.handlePasswordUnprotected(upn, folderId);
        }
    }

    private async handlePasswordProtected(upn: string, folderId: string, password?: string) {
        const checkPasswordResult = await this.romachApi.checkPasswords(folderId, password);
        if (checkPasswordResult.isOk()) {
            const isRightPassword = checkPasswordResult.value();
            if (isRightPassword) {
                return this.handleRightPassword(upn, folderId, password);
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

    private async handleRightPassword(upn: string, folderId: string, password: string) {
        const registerdFoldersResult = await this.repository.getRegisteredFoldersByIdAndPassword(folderId, password);
        const currentRegisterdFolders = registerdFoldersResult.value();
        if (!currentRegisterdFolders) return Result.fail('failed get registerdFolders with same folderId and password');

        const foldersResponse = await this.romachApi.getFolderByIdWithPassword(folderId, password);
        if (foldersResponse.isFail()) {
            this.logger.error('failed fetch folders from API');
            return Result.fail();
        }

        const folder = foldersResponse.value();
        const changedValidRegisterdFoldersResult = this.folderService.updateFolderToRegisterdFolders(
            currentRegisterdFolders,
            folder,
        );
        if (changedValidRegisterdFoldersResult.isFail()) {
            this.logger.error('failed update registerdFolders');
            return Result.fail();
        }

        const newRegisterdFolderResult = RegisteredFolder.createValidRegisteredFolder({
            upn,
            folder,
            password,
            lastValidPasswordTimestamp: Timestamp.now(),
        });
        if (newRegisterdFolderResult.isFail()) {
            this.logger.error('failed create new registerdFolder');
            return Result.fail();
        }

        const newRegisterdFolder = newRegisterdFolderResult.value();
        const updatedRegisterdFolders = changedValidRegisterdFoldersResult.value();
        if (updatedRegisterdFolders) {
            const upsertFolderResult = await this.repository.upsertRegisteredFolders([
                newRegisterdFolder,
                ...updatedRegisterdFolders,
            ]);
            if (upsertFolderResult.isFail()) {
                this.logger.error('failed upsert registerdFolder to repo');
                return Result.fail();
            }
        }
    }

    private async handleWrongPassword(upn: string, folderId: string) {
        const currentRegisterdFoldersResult = await this.repository.getRegisteredFoldersById(folderId);
        const currentRegisterdfolders = currentRegisterdFoldersResult.value();
        if (!currentRegisterdfolders) return Result.fail(currentRegisterdFoldersResult.error()); //registerdFoldersResult ?? - i could heap up logs

        const newRegisterdFolderResult = RegisteredFolder.createWorngPasswordRegisteredFolder({
            upn,
            folderId,
        });
        const newRegisterdFolder = newRegisterdFolderResult.value();
        if (!newRegisterdFolder) return Result.fail('failed create new registerdFolder');

        const changedRegisterdFoldersResult = this.changeStatusToRegisterdFolders(
            currentRegisterdfolders,
            'worng-password',
        );
        const changedRegisterdFolders = changedRegisterdFoldersResult.value();
        if (!changedRegisterdFolders) return Result.fail(changedRegisterdFoldersResult.error());

        const allRegisterdFoldersToUpsert = [...changedRegisterdFolders, newRegisterdFolder];
        const upsertFolderResult = await this.repository.upsertRegisteredFolders(allRegisterdFoldersToUpsert);
        if (upsertFolderResult.isFail()) {
            this.logger.error('failed upsert registerdFolder to repo');
            return Result.fail();
        }
    }

    private async handlePasswordUnprotected(upn: string, folderId: string) {
        const folderResult = await this.romachApi.getFolderByIdWithoutPassword(folderId);
        if (folderResult.isFail()) {
            this.logger.error('failed fetch folder from API by id', { folderId });
            return Result.fail();
        }

        const folder = folderResult.value();
        const newRegisterdFolderResult = RegisteredFolder.createValidRegisteredFolder({
            upn,
            folder,
            password: '',
            lastValidPasswordTimestamp: null,
        });

        const registerdFoldersResult = await this.repository.getRegisteredFoldersById(folderId);
        if (registerdFoldersResult.isFail()) {
            this.logger.error('failed get registerdFolders with same folderId', {
                folderId,
            });
            return Result.fail();
        }

        const upsertFolderResult = await this.repository.upsertRegisteredFolders([
            newRegisterdFolderResult.value(),
            ...registerdFoldersResult.value(),
        ]);
        if (upsertFolderResult.isFail()) {
            this.logger.error('failed upsert registerdFolders to repo');
            return Result.fail();
        }
    }

    private changeStatusToRegisterdFolders(registerdFolders: RegisteredFolder[], newStatus: RegisteredFolderStatus) {
        const createRegisterdFolder = RegisteredFolder.getCreateFunctionByStatus(newStatus);

        const createRegisterdfoldersResult = registerdFolders.map((registerdFolder) =>
            createRegisterdFolder({
                ...registerdFolder.getProps(),
                lastValidPasswordTimestamp: newStatus === 'valid' ? Timestamp.now() : null,
            }),
        );

        if (Result.combine(createRegisterdfoldersResult).isFail()) {
            this.logger.error('failed change status to registerdFolders');
            return Result.fail();
        }

        return Result.Ok(createRegisterdfoldersResult.map((x) => x.value()));
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
                            get current registerdFolders from repo by folderId, password
                            create registerdFolder with status 'valid' - on create fail 'error'
                            update current registeredFolders status and folder
                            upsert all registerdFolders to repo 
                        on wrong password
                            get current registerdFolders from repo by folderId, password
                            create registerdFolder with status 'wrong-password'
                            update current registeredFolders status
                            upsert all registerdFolders to repo 
                    on fail
                        get current registerdFolders from repo by folderId
                        create new registerdFolder with status 'error'
                        update current registeredFolders status
                        upsert all registerdFolders to repo 
                if not passwordProtected
                    fetch folder from API with id
                    get current registerdFolders from repo by folderId
                    create new registerdFolder with status 'valid' - on create fail 'error'
                    update current registeredFolders status and folder
                    upsert all registerdFolders to repo 
            on failed
                create registerdFolder with status 'error'
                insert registerdFolder to repo
                


            updateRegisterdFolders(upn, id, password, status, folder):
                get current registerdFolders from repo by folderId
                create new registerdFolder with status 'status'
                update current registeredFolders status 'status' and folder
                upsert all registerdFolders to repo 
    */
