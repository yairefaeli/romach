import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../interfaces/romach-repository.interface';
import { BasicFolderChange } from '../interfaces/basic-folder-changes.interface';
import { FoldersByIdResponse } from '../view-model/folders-by-ids-response';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { uniqBy } from 'lodash';
import { Result } from 'rich-domain';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';

export class FoldersService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly repository: RomachRepositoryInterface,
    ) { }

    /*
    # PSUDO:
        - basic folder updated (inserted, updated, deleted)
            handle deleted
                remove deleted from repo by folderId
            handle updated and inserted
                get registerdFolders from repo by folderId         // maybe change registerdFolders to folderContent?
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
        const res = await Promise.all([ // is it ok to do it parallel? i think yeah because ther are different ids.
            this.handleDeletedBasicFolders(change.deleted),
            this.handleUpsertedBasicFolders([...change.updated, ...change.inserted]),
        ]);

        if (Result.combine(res).isFail()) {
            return Result.fail();
        }

        return Result.Ok();
    }

    private async handleDeletedBasicFolders(
        deletedBasicFoldersIds: string[],
    ): Promise<Result<void>> {
        const deletedResult = await this.repository.deleteBasicFolderByIds(deletedBasicFoldersIds);

        if (deletedResult.isFail()) {
            this.logger.error('');
            return Result.fail();
        } else {
            this.logger.info('');
            return Result.Ok();
        }
    }

    private async handleUpsertedBasicFolders(
        updatedBasicFolders: BasicFolder[],
    ): Promise<Result<void>> {
        const updatedFoldersIds = updatedBasicFolders.map(
            (folder) => folder.getProps().id,
        );

        const foldersFromRepoResult = await this.repository.getFoldersByIds(updatedFoldersIds);
        if (foldersFromRepoResult.isFail()) {
            this.logger.error('faild get folders from repo by ids');
            return Result.fail();
        }

        const foldersFromRepo = foldersFromRepoResult.value();
        const registerdFolders = foldersFromRepo.filter(folder => updatedBasicFolders.find(basicFolder => folder.folderId == basicFolder.getProps().id).getProps().updatedAt == folder.content.getProps().basicFolder.getProps().updatedAt);
        const folderIdsAndPasswords = this.transformFoldersToInput(registerdFolders);
        const foldersFromAPIResult = await this.romachApi.getFoldersByIds(folderIdsAndPasswords);
        if (foldersFromAPIResult.isFail()) {
            this.logger.error('failed fetch folders from API by ids')
            return Result.fail();
        }

        const foldersFromAPI = foldersFromAPIResult.value();
        // const upsertRegisteredFoldersResult = await this.upsertFoldersToRepo(foldersFromAPI);
        // get registerd folders from repo
        // const input = { upn, folderId: foldersFromAPI. };
        // const newFolderResult = RegisteredFolder.createValidRegisteredFolder(input);
        // if (newFolderResult.isFail()) {
        //     this.logger.error("faild upsert registerdFolder");
        //     return Result.fail();
        // }
        // const upsertFoldersResult = await this.repository.upsertRegisteredFolders([newFolder]);

        // if (upsertFoldersResult.isFail()) {
        //     this.logger.error('')
        // }

        // if (upsertRegisteredFoldersResult.isFail()) {
        //     return Result.fail();
        // }

        return Result.Ok();
    }

    private transformFoldersToInput(folders: FoldersByIdResponse[]): { id: string, password?: string }[] {
        const nonUniquedFolders = uniqBy(
            folders,
            (item) => `${item.folderId}-${item.password}`,
        );

        const inputs = nonUniquedFolders.map((folder) => {
            if (this.isFolderPasswordProtected(folder))
                return {
                    id: folder.folderId,
                    password: folder.password,
                }
            return { id: folder.folderId }
        })

        return inputs;
    }

    private isFolderPasswordProtected(folder: FoldersByIdResponse) {
        return folder.content.getProps().basicFolder.getProps().isPasswordProtected
    }
    /*
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    
     - user requested new folder (upn, id, password)
            select basicFolder from repo by id
            on sucess
                if passwordProtected
                    check registerdFolder with API by UPN,folderId
                    on sucess
                        fetch folder from API with id and password
                        get registerdFolders from repo by folderId, password
                        upsert registerdFolders to repo with status 'valid' and update valid_password_timestamp
                    on fail
                        get registerdFolders from repo by folderId
                        upsert registerdFolders to repo with status ____
                if not passwordProtected
                    fetch folder from API with id and password
                    upsert registerdFolders to repo with status ____
            on failed
                upsert registerdFolders to repo with status ____
                
    */

    async userRequstedNewFolder(upn: string, folderId: string, password?: string): Promise<Result<void>> {

        const basicfolderResult = await this.repository.getBasicFolderById(folderId);
        if (basicfolderResult.isFail()) {
            return Result.fail()
        }

        const basicFolder = basicfolderResult.value();
        if (basicFolder.getProps().isPasswordProtected) {
            const checkPasswordResult = await this.romachApi.checkPassword(folderId, password); // what happend if wrong password? its failed or ok?

            if (checkPasswordResult.isOk()) {
                // const checkedFolder = checkPasswordResult.value() // i got a folder here? can i depend on it and not fetch again from API?
                const input = { id: folderId, password }
                const foldersResponse = await this.romachApi.getFolderById(input)
                if (foldersResponse.isFail()) {
                    this.logger.error("faild fetch folders from API");
                    return Result.fail();
                }

                const registerdFoldersResult = await this.repository.getRegisteredFoldersByIdAndPassword(folderId, password);
                if (registerdFoldersResult.isFail()) {
                    this.logger.error("faild get registerdFolders with same folderId");
                    return Result.fail();
                }

                const creatWrongPasswordRegisterdFolders = registerdFoldersResult.value().map(registerdFolder => RegisteredFolder.createValidRegisteredFolder(registerdFolder.getProps()));
                if (Result.combine(creatWrongPasswordRegisterdFolders).isFail()) {
                    this.logger.error("faild create registerdFolders");
                    return Result.fail();
                }

                const newRegisterdFolders = Result.combine(creatWrongPasswordRegisterdFolders).value();
                const upsertFolderResult = await this.repository.upsertRegisteredFolders(newRegisterdFolders);
                if (upsertFolderResult.isFail()) {
                    this.logger.error("faild upsert registerdFolder");
                    return Result.fail();
                }
            }

            if ((checkPasswordResult).isFail()) {
                this.logger.error('failed to check password');

                const registerdFoldersResult = await this.repository.getRegisteredFoldersById(folderId)
                if (registerdFoldersResult.isFail()) {
                    this.logger.error("faild get registerdFolders with same folderId");
                    return Result.fail();
                }

                const creatWrongPasswordRegisterdFolders = registerdFoldersResult.value().map(registerdFolder => RegisteredFolder.createWorngPasswordRegisteredFolder(registerdFolder.getProps()));
                if (Result.combine(creatWrongPasswordRegisterdFolders).isFail()) {
                    this.logger.error("faild create registerdFolders");
                    return Result.fail();
                }

                const newRegisterdFolders = Result.combine(creatWrongPasswordRegisterdFolders).value();
                const upsertFolderResult = await this.repository.upsertRegisteredFolders(newRegisterdFolders);
                if (upsertFolderResult.isFail()) {
                    this.logger.error("faild upsert registerdFolder");
                    return Result.fail();
                }
            }
        } else {

        }
        return Result.Ok();
    }
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




    - user mutation folders interval
        get registerdFolders from repo by UPN,folderId
        update registration_timestamp on registerdFolders from repo by UPN,folderId
        return registerdFolders statuses


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

