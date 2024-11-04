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

    async basicFolderUpdated(change: BasicFolderChange): Promise<Result<void>> {

        // const deletedResult = await this.handleDeletedBasicFolders(change.deleted);
        // if (deletedResult.isFail()) {
        //     return Result.fail();
        // }

        // const upsertedResult = await this.handleUpsertedBasicFolders([...change.updated, ...change.inserted]);
        // if (upsertedResult.isFail()) {
        //     return Result.fail();
        // }

        // return Result.Ok();
        const res = await Promise.all([
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
            this.logger.error('')
        } else {
            this.logger.info('')
        }

        return deletedResult;
    }

    private async handleUpsertedBasicFolders(
        updatedBasicFolders: BasicFolder[],
    ): Promise<Result<void>> {
        const foldersFromRepoResult = await this.getFoldersFromRepo(updatedBasicFolders)
        if (foldersFromRepoResult.isFail()) {
            return Result.fail();
        }

        const foldersFromRepo = foldersFromRepoResult.value();
        foldersFromRepo.filter(folder => updatedBasicFolders.find(basicFolder => folder.folderId == basicFolder.getProps().id).getProps().updatedAt == folder.content.getProps().basicFolder.getProps().updatedAt)

        const foldersFromAPIResponse = await this.getFoldersFromAPI(foldersFromRepo)
        if (foldersFromAPIResponse.isFail()) {
            return Result.fail();
        }

        const foldersFromAPI = foldersFromAPIResponse.value();
        const upsertRegisteredFoldersResult = await this.upsertFoldersToRepo(foldersFromAPI);
        if (upsertRegisteredFoldersResult.isFail()) {
            return Result.fail();
        }

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

    private async getFoldersFromRepo(updatedBasicFolders: BasicFolder[]) {
        const updatedFoldersIds = updatedBasicFolders.map(
            (folder) => folder.getProps().id,
        );

        const foldersFromRepoResult = await this.repository.getFoldersByIds(updatedFoldersIds);
        if (foldersFromRepoResult.isFail()) {
            this.logger.error('');
        } else {
            this.logger.info('');
        }

        return foldersFromRepoResult;
    }

    private async getFoldersFromAPI(registerdFolders: FoldersByIdResponse[]) {
        const folderIdsAndPasswords = this.transformFoldersToInput(registerdFolders);
        const foldersFromAPIResult = await this.romachApi.getFoldersByIds(folderIdsAndPasswords);
        if (foldersFromAPIResult.isFail()) {
            this.logger.error('')
        } else {
            this.logger.info('')
        }

        return foldersFromAPIResult;
    }

    private async upsertFoldersToRepo(foldersFromAPI: FoldersByIdResponse[]) {
        const upsertFoldersResult = await this.repository.upsertRegisteredFolders(foldersFromAPI);

        if (upsertFoldersResult.isFail()) {
            this.logger.error('')
        } else {
            this.logger.info('')
        }

        return upsertFoldersResult;
    }
    /*
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@MatanAzarzar
    */

    async userRequstedNewFolder(upn: string, folderId: string, password?: string): Promise<Result<void>> {
        // - user requested new folder (registerdFolder)
        //     if protected
        let folderToUpsert = folder;
        if (folder.getProps().isPasswordProtected) {
            const checkPasswordResult = await this.romachApi.checkPassword(folder.getProps().folderId, folder.getProps().password);
            if ((checkPasswordResult).isFail()) {
                const newFolderResult = RegisteredFolder.createWorngPasswordRegisteredFolder(folder.getProps());
                if (newFolderResult.isFail()) {
                    return Result.fail()
                }
                folderToUpsert = newFolderResult.value()
                this.logger.error('failed to check password');
            } else {
                const input = { id: folder.getProps().folderId, password: folder.getProps().password }
                const foldersResponse = await this.romachApi.getFolderById(input)
                if (foldersResponse.isFail()) {

                } else {
                    RegisteredFolder.createGeneralErrorRegisteredFolder
                }
            }
        } else {

        }

        const res = await this.repository.upsertRegisteredFolders([folderToUpsert]);
        if (res.isFail()) {
            this.logger.error('failed to save to repo');
        }
        //     check registerdFolder with API by UPN,folderId
        //     on sucess
        //         fetch folder from API with id and password
        //         update registerdFolders in repo by folderId, password
        //     on fail
        //         insert registerdFolder to repo
        // if unprotected
        //     fetch folder from API with id
        //     insert registerdFolder to repo
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


     - user requested new folder (upn, id, password)
            select basicFolder from repo by id
            if protected
                check registerdFolder with API by UPN,folderId
                on sucess
                    fetch folder from API with id and password
                    get registerdFolders from repo by folderId, password
                    update valid_password_timestamp for all
                    upsert registerdFolders to repo
                on fail
                    insert registerdFolder to repo
            if unprotected
                fetch folder from API with id and password
                insert registerdFolder to repo


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

