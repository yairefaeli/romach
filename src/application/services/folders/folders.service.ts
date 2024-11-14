import { RegisteredFolderErrorStatus, RegisteredFolderStatus } from 'src/domain/entities/RegisteredFolderStatus';
import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/Folder';
import { filter, partition, uniqBy } from 'lodash';
import { Result } from 'rich-domain';

export class FoldersService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly repository: RomachRepositoryInterface,
    ) {}

    async upsertGeneralerror(
        upn: string,
        folderId: string,
        isPasswordProtected: boolean,
    ): Promise<Result<Folder | void, RegisteredFolderErrorStatus>> {
        const input = {
            upn,
            folderId,
            isPasswordProtected,
            lastValidPasswordTimestamp: Timestamp.ts1970(), // need to think about it
        };
        const newRegisteredFolderResult = RegisteredFolder.createGeneralErrorRegisteredFolder(input);
        if (newRegisteredFolderResult.isFail()) {
            this.logger.error('failed to create new registeredFolder');
            return Result.fail('general-error');
        }

        const newRegisteredFolder = newRegisteredFolderResult.value();
        const upsertFolderResult = await this.repository.upsertRegisteredFolder(newRegisteredFolder);
        if (upsertFolderResult.isFail()) {
            this.logger.error('failed to upsert registeredFolder to repo');
            return Result.fail('general-error');
        }
        return Result.fail();
    }

    async upsertValid(upn: string, folderId: string, folder: Folder, password?: string): Promise<Result<Folder>> {
        const registeredFoldersResult = await this.repository.getRegisteredFoldersByIdAndPassword(folderId, password);
        const currentregisteredFolders = registeredFoldersResult.value();
        if (!currentregisteredFolders)
            return Result.fail('failed to get registeredFolders with same folderId and password');

        const changedValidregisteredFoldersResult = this.updateFolderToRegisteredFolders(
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

        return Result.Ok(folder);
    }

    async upsertWrongPassword(upn: string, folderId: string) {
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

    changeStatusToregisteredFolders(registeredFolders: RegisteredFolder[], newStatus: RegisteredFolderStatus) {
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

    updateFoldersToRegisteredFolders(registeredFolders: RegisteredFolder[], folders: Folder[]) {
        const yair = folders.flatMap((folder) => {
            const registeredFoldersWithSameFolder = filter(
                registeredFolders,
                (registeredFolder) =>
                    registeredFolder.getProps().folderId === folder.getProps().basicFolder.getProps().id,
            );
            return this.updateFolderToRegisteredFolders(registeredFoldersWithSameFolder, folder);
        });

        if (Result.combine(yair).isFail()) return Result.fail();

        const snir = yair.flatMap((x) => {
            // azarzar help
            const y = x.value();
            if (y) return y;
        });

        return Result.Ok(snir);
    }

    updateFolderToRegisteredFolders(registeredFolders: RegisteredFolder[], folder: Folder) {
        const createregisteredfoldersResult = registeredFolders.map((registeredFolder) => {
            const createregisteredFolder = RegisteredFolder.getCreateFunctionByStatus(
                registeredFolder.getProps().status,
            );
            return createregisteredFolder({
                ...registeredFolder.getProps(),
                folder,
                lastValidPasswordTimestamp: Timestamp.now(),
            });
        });

        if (Result.combine(createregisteredfoldersResult).isFail()) {
            this.logger.error('failed update folder to registeredFolders');
            return Result.fail();
        }

        return Result.Ok(createregisteredfoldersResult.map((x) => x.value()));
    }

    /* 
        #PSUDO:
        - user mutation folders interval
                get registeredFolders from repo by UPN,folderId
                delete irrelevant registeredFolders
                update registration_timestamp on registeredFolders from repo by UPN,folderId

    */
    async userMutationFolderInterval(upn: string, folderIds: string[]) {
        const getRegisteredFoldersByUpnResult = await this.repository.getRegisteredFoldersByUpn(upn);
        const registeredFolders = getRegisteredFoldersByUpnResult.value();
        const [relevantregisteredFolders, irrelevantregisteredFolders] = partition(
            registeredFolders,
            (registeredFolder) => folderIds.includes(registeredFolder.getProps().folderId),
        );

        const irrelevantregisteredFoldersIds = irrelevantregisteredFolders.map(
            (registeredFolder) => registeredFolder.getProps().folderId,
        );
        const relevantregisteredFoldersIds = relevantregisteredFolders.map(
            (registeredFolder) => registeredFolder.getProps().folderId,
        );

        await this.repository.deleteRegisteredFoldersByIdsForUpn(irrelevantregisteredFoldersIds, upn);
        await this.repository.updateRegistrationByUpnAndFolderIds(relevantregisteredFoldersIds, upn);
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
            status = 'wrong-password' | 'general-error' | 'not-found'

        GC -
            registration_timestamp > 60s
            valid_password_timestamp > 24h

    !! LOGS !!

    questions for eyal:
    - when i use the entity registeredfolder?
    - how the romach API look? the check and the folders content? what error we get from them?
    -
#### psudo:




    

    - retry failed statuses
        get registeredFolder from repo by status - failed statuses
        # if protected... like in new folder


    - GC
        interval of 30s
            delete registeredFolder from repo
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
