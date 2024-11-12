import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { FoldersByIdResponse } from 'src/application/view-model/folders-by-ids-response';
import { RegisteredFolderStatus } from 'src/domain/entities/RegisteredFolderStatus';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/Folder';
import { Result } from 'rich-domain';

export class FoldersService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly repository: RomachRepositoryInterface,
    ) {}
    /*
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    
    #PSUDO:
     - user requested new folder (upn, id, password)
            select basicFolder from repo by folderId
            on sucess
                if passwordProtected
                    check with API by password and folderId
                    on sucess
                        fetch folder from API with id and password
                        get registerdFolders from repo by folderId, password
                        upsert registerdFolders to repo with status 'valid' and update valid_password_timestamp
                    on fail
                        get registerdFolders from repo by folderId
                        upsert registerdFolders to repo with status ____
                if not passwordProtected
                    fetch folder from API with id
                    upsert registerdFolders to repo with status ____
            on failed
                upsert registerdFolders to repo with status ____
                
    */

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
        if (result) {
            return await this.handleNewFolderwithError(upn, folderId);
        }
    }

    async handleNewFolderwithError(upn: string, folderId: string) {
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

    handleNewFolder(basicFolder: BasicFolder, upn: string, folderId: string, password?: string) {
        if (basicFolder.getProps().isPasswordProtected) {
            return this.handlePasswordProtected(upn, folderId, password);
        } else {
            return this.handlePasswordUnprotected(upn, folderId);
        }
    }

    private async handlePasswordProtected(upn: string, folderId: string, password?: string) {
        const checkPasswordResult = await this.romachApi.checkPasswords(folderId, password); // what happend if wrong password? its failed or ok?
        if (checkPasswordResult.isOk()) {
            const foldersResponse = await this.romachApi.getFolderByIdWithPassword(folderId, password);
            if (foldersResponse.isFail()) {
                this.logger.error('failed fetch folders from API');
                return Result.fail();
            }

            const folder = foldersResponse.value();

            const registerdFoldersResult = await this.repository.getRegisteredFoldersByIdAndPassword(
                folderId,
                password,
            );
            if (registerdFoldersResult.isFail()) {
                this.logger.error('failed get registerdFolders with same folderId');
                return Result.fail();
            }

            const createValidRegisterdFolders = registerdFoldersResult.value().map((registerdFolder) =>
                RegisteredFolder.createValidRegisteredFolder({
                    ...registerdFolder.getProps(),
                    lastValidPasswordTimestamp: Timestamp.now(),
                }),
            );
            if (Result.combine(createValidRegisterdFolders).isFail()) {
                this.logger.error('failed create registerdFolders');
                return Result.fail();
            }

            const updatedRegisterdFolders: RegisteredFolder[] = Result.combine(createValidRegisterdFolders).value();

            const upsertFolderResult = await this.repository.upsertRegisteredFolders(updatedRegisterdFolders);
            if (upsertFolderResult.isFail()) {
                this.logger.error('failed upsert registerdFolder to repo');
                return Result.fail();
            }

            const matan = this.upsertRegisterdFolders([{ folder, upn }]);
        }
        if (checkPasswordResult.isFail()) {
            this.logger.error('failed to check password for folder', {
                folderId,
                password,
            });

            const registerdFoldersResult = await this.repository.getRegisteredFoldersById(folderId);
            if (registerdFoldersResult.isFail()) {
                this.logger.error('failed get registerdFolders with same folderId', {
                    folderId,
                });
                return Result.fail();
            }

            const createWrongPasswordRegisterdFolders = registerdFoldersResult
                .value()
                .map((registerdFolder) =>
                    RegisteredFolder.createWorngPasswordRegisteredFolder(registerdFolder.getProps()),
                );
            if (Result.combine(createWrongPasswordRegisterdFolders).isFail()) {
                this.logger.error('failed create registerdFolders');
                return Result.fail();
            }

            const newRegisterdFolderResult = RegisteredFolder.createWorngPasswordRegisteredFolder({
                upn,
                folderId,
            });
            if (newRegisterdFolderResult.isFail()) {
                this.logger.error('failed create new registerdFolder');
                return Result.fail();
            }

            const newRegisterdFolder = newRegisterdFolderResult.value();
            const updatedRegisterdFolders = Result.combine(createWrongPasswordRegisterdFolders).value();
            const upsertFolderResult = await this.repository.upsertRegisteredFolders([
                ...updatedRegisterdFolders,
                newRegisterdFolder,
            ]);
            if (upsertFolderResult.isFail()) {
                this.logger.error('failed upsert registerdFolder to repo');
                return Result.fail();
            }
        }
    }

    private async handlePasswordUnprotected(upn: string, folderId: string) {
        const folderResult = await this.romachApi.getFolderByIdWithoutPassword(folderId);
        if (folderResult.isFail()) {
            this.logger.error('failed fetch folder from API by id', { folderId });
        }

        const folder = folderResult.value();

        const yair = this.updateCurrentRegisterdFolders(folder);
        const snir = this.upsertRegisterdFolders([{ folderId, folder, upn }], 'valid');
    }

    private async updateCurrentRegisterdFolders(folder: Folder) {
        const folderId = folder.getProps().basicFolder.getProps().id;
        const registerdFoldersResult = await this.repository.getRegisteredFoldersById(folderId);
        if (registerdFoldersResult.isFail()) {
            this.logger.error('failed get registerdFolders with same folderId', {
                folderId,
            });
            return Result.fail();
        }

        const createValidRegisterdFolders = registerdFoldersResult.value().map((registerdFolder) =>
            RegisteredFolder.createValidRegisteredFolder({
                ...registerdFolder.getProps(),
                folder,
                lastValidPasswordTimestamp: Timestamp.now(),
            }),
        );
        if (Result.combine(createValidRegisterdFolders).isFail()) {
            this.logger.error('failed create registerdFolders');
            return Result.fail();
        }

        const updatedRegisterdFolders: RegisteredFolder[] = Result.combine(createValidRegisterdFolders).value(); // is it ok to combine all result?
        const upsertFolderResult = await this.repository.upsertRegisteredFolders(updatedRegisterdFolders);
        if (upsertFolderResult.isFail()) {
            this.logger.error('failed upsert registerdFolder to repo');
            return Result.fail();
        }
    }

    private async upsertRegisterdFolders(registerdFolders: RegisteredFolder[], status: RegisteredFolderStatus) {
        const createRegisterdfoldersResult = this.changeStautsToRegisterdFolders(registerdFolders, status);

        if (createRegisterdfoldersResult.isFail()) {
            return Result.fail();
        }
        const upsertFolderResult = await this.repository.upsertRegisteredFolders(newRegisterdFolders);
        if (upsertFolderResult.isFail()) {
            this.logger.error('failed upsert registerdFolders to repo');
            return Result.fail();
        }
    }

    private getCreateFunctionByStatus(status: RegisteredFolderStatus) {
        switch (status) {
            case 'valid':
                return RegisteredFolder.createValidRegisteredFolder;
            case 'worng-password':
                return RegisteredFolder.createWorngPasswordRegisteredFolder;
            case 'general-error':
                return RegisteredFolder.createGeneralErrorRegisteredFolder;
            case 'not-found':
                return RegisteredFolder.createNotFoundRegisteredFolder;
            case 'loading':
                return RegisteredFolder.createLoadingRegisteredFolder;
        }
    }

    private changeStautsToRegisterdFolders(registerdFolders: RegisteredFolder[], newStatus: RegisteredFolderStatus) {
        const createRegisterdFolder = this.getCreateFunctionByStatus(newStatus);

        const createRegisterdfoldersResult = registerdFolders.map((registerdFolder) =>
            createRegisterdFolder({
                ...registerdFolder.getProps(),
                lastValidPasswordTimestamp: Timestamp.now(),
            }),
        );

        if (Result.combine(createRegisterdfoldersResult).isFail()) {
            this.logger.error('failed change status to registerdFolders');
            return Result.fail();
        }

        return Result.Ok(createRegisterdfoldersResult.map((x) => x.value()));
    }

    private updateFolderToRegisterdFolders(registerdFolders: RegisteredFolder[], folder: Folder) {
        const createRegisterdfoldersResult = registerdFolders.map((registerdFolder) => {
            const createRegisterdFolder = this.getCreateFunctionByStatus(registerdFolder.getProps().status);
            return createRegisterdFolder({
                ...registerdFolder.getProps(),
                folder,
                lastValidPasswordTimestamp: Timestamp.now(),
            });
        });

        if (Result.combine(createRegisterdfoldersResult).isFail()) {
            this.logger.error('failed change status to registerdFolders');
            return Result.fail();
        }

        return Result.Ok(createRegisterdfoldersResult.map((x) => x.value()));
    }
}
