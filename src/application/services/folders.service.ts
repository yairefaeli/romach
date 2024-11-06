import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../interfaces/romach-repository.interface';
import { BasicFolderChange } from '../interfaces/basic-folder-changes.interface';
import { FoldersByIdResponse } from '../view-model/folders-by-ids-response';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Result } from 'rich-domain';
import { uniqBy } from 'lodash';

export class FoldersService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly repository: RomachRepositoryInterface,
    ) {}

    /*
    # PSUDO:
        - basic folder updated (inserted, updated, deleted)
            handle deleted
                remove deleted from repo by folderId
            handle updated and inserted
                get registerdFolders from repo by folderId
                filter only lastUpdateTime is different
                uniq by folderId, password
                for registerdFolders with same folderId, password
                    fetch folders from API with folderId, password
                        onSuccess
                            update registerdFolder's content in repo by folderId, password
                        onFailed
                            update registerdFolder's status=failed and content=null in repo by folderId, password


    */

    async basicFolderUpdated(change: BasicFolderChange): Promise<Result<void>> {
        const res = await Promise.all([
            // is it ok to do it parallel? i think yeah because there are different ids.
            this.handleDeletedBasicFolders(change.deleted),
            this.handleUpsertedBasicFolders([...change.updated, ...change.inserted]),
        ]);

        if (Result.combine(res).isFail()) {
            return Result.fail();
        }

        return Result.Ok();
    }

    private async handleDeletedBasicFolders(deletedBasicFoldersIds: string[]): Promise<Result<void>> {
        const deletedResult = await this.repository.deleteBasicFolderByIds(deletedBasicFoldersIds);

        if (deletedResult.isFail()) {
            this.logger.error('');
            return Result.fail();
        } else {
            this.logger.info('');
            return Result.Ok();
        }
    }

    private async handleUpsertedBasicFolders(upsartedBasicFolders: BasicFolder[]): Promise<Result<void>> {
        const upsertedFoldersIds = upsartedBasicFolders.map((folder) => folder.getProps().id);
        const registerdFoldersFromRepoResult = await this.repository.getRegisteredFoldersByIds(upsertedFoldersIds);
        if (registerdFoldersFromRepoResult.isFail()) {
            this.logger.error('faild get registerdFolders from repo by ids');
            return Result.fail();
        }

        const registerdFoldersFromRepo = registerdFoldersFromRepoResult.value();
        const upsertedRegisterdFolders = registerdFoldersFromRepo.filter(
            (folder) =>
                upsartedBasicFolders
                    .find((basicFolder) => folder.getProps().folderId == basicFolder.getProps().id)
                    .getProps().updatedAt === folder.getProps().updatedAtTimestamp.toString(), // yeah? is to string will fix it? why updatedAt in basic folder isnt timestamp?
        );
        const folderIdsAndPasswords = this.transformFoldersToInput(upsertedRegisterdFolders);
        const foldersFromAPIResult = await this.romachApi.getFoldersByIds(folderIdsAndPasswords); // what happend if one of the folders have wrong password? do i need to check that?
        if (foldersFromAPIResult.isFail()) {
            this.logger.error('failed fetch folders from API by ids and passwords');
            return Result.fail();
        }

        const foldersFromAPI = foldersFromAPIResult.value();
        const newUpsertedRegisterdFoldersResults = upsertedRegisterdFolders.map((registerdFolder) => {
            const folder = foldersFromAPI.find((folder) => folder.folderId === registerdFolder.getProps().folderId);
            return RegisteredFolder.createValidRegisteredFolder({
                ...registerdFolder.getProps(),
                folder: folder.content,
            });
        });
        if (Result.combine(newUpsertedRegisterdFoldersResults).isFail()) {
            this.logger.error('failed create registerdFolders');
            return Result.fail();
        }

        const newUpsertedRegisterdFolders = Result.combine(newUpsertedRegisterdFoldersResults).value(); // is it ok to combine all result and get value?
        const upsertRegisterdFoldersResult = await this.repository.upsertRegisteredFolders([newUpsertedRegisterdFolders]);
        if (upsertRegisterdFoldersResult.isFail()) {
            this.logger.error('faild upsert registerdFolders to repo');
            return Result.fail();
        }

        return Result.Ok();
    }

    private transformFoldersToInput(folders: RegisteredFolder[]): { id: string; password?: string }[] {
        const nonUniquedFolders = uniqBy(folders, (item) => `${item.getProps().folderId}-${item.getProps().password}`);

        const inputs = nonUniquedFolders.map((folder) => {
            if (folder.getProps().isPasswordProtected)
                return {
                    id: folder.getProps().folderId,
                    password: folder.getProps().password,
                };
            return { id: folder.getProps().folderId };
        });

        return inputs;
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

    async userRequstedNewFolder(upn: string, folderId: string, password?: string): Promise<Result<void>> {
        const basicfolderResult = await this.repository.getBasicFolderById(folderId);
        if (basicfolderResult.isFail()) {
            this.logger.error('faild fetch basicFolders from repo by folderId', {
                folderId,
            });
            return Result.fail();
        }

        const basicFolder = basicfolderResult.value();
        if (basicFolder.getProps().isPasswordProtected) {
            const checkPasswordResult = await this.romachApi.checkPassword(folderId, password); // what happend if wrong password? its failed or ok?
            if (checkPasswordResult.isOk()) {
                // const checkedFolder = checkPasswordResult.value() // i got a folder here? can i depend on it and not fetch again from API?
                const input = { id: folderId, password };
                const foldersResponse = await this.romachApi.getFolderById(input);
                if (foldersResponse.isFail()) {
                    this.logger.error('faild fetch folders from API');
                    return Result.fail();
                }

                const folder = foldersResponse.value();

                const registerdFoldersResult = await this.repository.getRegisteredFoldersByIdAndPassword(
                    folderId,
                    password,
                );
                if (registerdFoldersResult.isFail()) {
                    this.logger.error('faild get registerdFolders with same folderId');
                    return Result.fail();
                }

                const createValidRegisterdFolders = registerdFoldersResult.value().map((registerdFolder) =>
                    RegisteredFolder.createValidRegisteredFolder({
                        ...registerdFolder.getProps(),
                        lastValidPasswordTimestamp: Timestamp.now(),
                    }),
                );
                if (Result.combine(createValidRegisterdFolders).isFail()) {
                    this.logger.error('faild create registerdFolders');
                    return Result.fail();
                }

                const updatedRegisterdFolders: RegisteredFolder[] = Result.combine(createValidRegisterdFolders).value(); // is it ok to combine all result and get value?
                const newRegisterdFolderResult = RegisteredFolder.createValidRegisteredFolder({
                    upn,
                    folder: folder.content,
                    password,
                    lastValidPasswordTimestamp: Timestamp.now(),
                });
                if (newRegisterdFolderResult.isFail()) {
                    this.logger.error('faild create new registerdFolder');
                    return Result.fail();
                }

                const newRegisterdFolder = newRegisterdFolderResult.value();
                const upsertFolderResult = await this.repository.upsertRegisteredFolders([
                    ...updatedRegisterdFolders,
                    newRegisterdFolder,
                ]);
                if (upsertFolderResult.isFail()) {
                    this.logger.error('faild upsert registerdFolder to repo');
                    return Result.fail();
                }
            }
            if (checkPasswordResult.isFail()) {
                this.logger.error('failed to check password for folder', {
                    folderId,
                    password,
                });

                const registerdFoldersResult = await this.repository.getRegisteredFoldersById(folderId);
                if (registerdFoldersResult.isFail()) {
                    this.logger.error('faild get registerdFolders with same folderId', {
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
                    this.logger.error('faild create registerdFolders');
                    return Result.fail();
                }

                const newRegisterdFolderResult = RegisteredFolder.createWorngPasswordRegisteredFolder({
                    upn,
                    folderId,
                });
                if (newRegisterdFolderResult.isFail()) {
                    this.logger.error('faild create new registerdFolder');
                    return Result.fail();
                }

                const newRegisterdFolder = newRegisterdFolderResult.value();
                const updatedRegisterdFolders = Result.combine(createWrongPasswordRegisterdFolders).value();
                const upsertFolderResult = await this.repository.upsertRegisteredFolders([
                    ...updatedRegisterdFolders,
                    newRegisterdFolder,
                ]);
                if (upsertFolderResult.isFail()) {
                    this.logger.error('faild upsert registerdFolder to repo');
                    return Result.fail();
                }
            }
        } else if (!basicFolder.getProps().isPasswordProtected) {
            // i put it only for me to know i am in this case.
            const folderResult = await this.romachApi.getFolderById({ id: folderId });
            if (folderResult.isFail()) {
                this.logger.error('failed fetch folder from API by id', { folderId });
            }

            const registerdFoldersResult = await this.repository.getRegisteredFoldersById(folderId);
            if (registerdFoldersResult.isFail()) {
                this.logger.error('faild get registerdFolders with same folderId', {
                    folderId,
                });
                return Result.fail();
            }

            const createValidRegisterdFolders = registerdFoldersResult.value().map((registerdFolder) =>
                RegisteredFolder.createValidRegisteredFolder({
                    ...registerdFolder.getProps(),
                    lastValidPasswordTimestamp: Timestamp.now(),
                }),
            );
            if (Result.combine(createValidRegisterdFolders).isFail()) {
                this.logger.error('faild create registerdFolders');
                return Result.fail();
            }

            const folder = folderResult.value();
            const updatedRegisterdFolders: RegisteredFolder[] = Result.combine(createValidRegisterdFolders).value(); // is it ok to combine all result?
            const newRegisterdFolderResult = RegisteredFolder.createValidRegisteredFolder({
                upn,
                folder: folder.content,
                password,
                lastValidPasswordTimestamp: Timestamp.now(),
            });
            if (newRegisterdFolderResult.isFail()) {
                this.logger.error('faild create new registerdFolder');
                return Result.fail();
            }

            const newRegisterdFolder = newRegisterdFolderResult.value();
            const upsertFolderResult = await this.repository.upsertRegisteredFolders([
                ...updatedRegisterdFolders,
                newRegisterdFolder,
            ]);
            if (upsertFolderResult.isFail()) {
                this.logger.error('faild upsert registerdFolder to repo');
                return Result.fail();
            }
        }
        // i dont egdalti rosh and thought here i will only insert this folder without updating others
        const newRegisterdFolderResult = RegisteredFolder.createGeneralErrorRegisteredFolder({
            upn,
            folderId,
            isPasswordProtected: false,
            lastValidPasswordTimestamp: null,
        });
        if (newRegisterdFolderResult.isFail()) {
            this.logger.error('faild create new registerdFolder');
            return Result.fail();
        }

        const newRegisterdFolder = newRegisterdFolderResult.value();
        const upsertFolderResult = await this.repository.upsertRegisteredFolder(newRegisterdFolder);
        if (upsertFolderResult.isFail()) {
            this.logger.error('faild upsert registerdFolder to repo');
            return Result.fail();
        }
        return Result.Ok();
    }

    /* 
    #PSUDO:
      - user mutation folders interval
              get registerdFolders from repo by UPN,folderId
              update registration_timestamp on registerdFolders from repo by UPN,folderId
              return registerdFolders statuses

  */
}

// TODO
/*
    when need to fetch?
        - user requested new folder
        - basic folder updated
        - on retry
    after that
        - update status
        - update updatedAtTimestamp
        - save to repo

    while-true:
        retry failed statuses -
            status = 'worng-password' | 'general-error' | 'not-found'

        GC -
            registration_timestamp > 60s
            valid_password_timestamp > 24h

    !! LOGS !!

    questions for eyal:
    - when i use the entity Registerdfolder?
    - how the romach API look? the check and the folders content? what error we get from them?
    -
#### psudo:




    

    - retry failed statuses
        get registerdFolder from repo by status - failed statuses
        # if protected... like in new folder


    - GC
        interval of 30s
            delete registerdFolder from repo
                where registration_timestamp > 60s or valid_password_timestamp > 24h
    */

// private handleUpdatedBasicFoldersReactive(
//     updatedBasicFolders: BasicFolder[]
// ): Observable<Result<void>> {
//     return from(this.getFoldersFromRepo(updatedBasicFolders)).pipe(
//         switchMap((foldersFromRepoResult) => {
//             if (foldersFromRepoResult.isFail()) {
//                 return of(Result.fail('Failed to fetch folders from repository'));
//             }
//             const foldersFromRepo = foldersFromRepoResult.value();
//             return from(this.getFoldersFromAPI(foldersFromRepo));
//         }),
//         filter(foldersFromAPIResponse => foldersFromAPIResponse.isFail()),
//         switchMap((foldersFromAPIResponse) => {
//             if (foldersFromAPIResponse.isFail()) {
//                 return of(Result.fail('Failed to fetch folders from API'));
//             }
//             const foldersFromAPI = foldersFromAPIResponse.value();
//             return from(this.upsertFoldersToRepo(foldersFromAPI));
//         }),
//         map((upsertRegisteredFoldersResult) => {
//             if (upsertRegisteredFoldersResult.isFail()) {
//                 return Result.fail('Failed to upsert folders to repository');
//             }
//             return Result.Ok();
//         })
//     );
// }
