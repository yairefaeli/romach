import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/Folder';
import { filter, uniqBy } from 'lodash';
import { Result } from 'rich-domain';

export class FoldersService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly repository: RomachRepositoryInterface,
    ) {}

    updateFoldersToRegisterdFolders(registerdFolders: RegisteredFolder[], folders: Folder[]) {
        const yair = folders.flatMap((folder) => {
            const registerdfoldersWithSameFolder = filter(
                registerdFolders,
                (registerdFolder) =>
                    registerdFolder.getProps().folderId === folder.getProps().basicFolder.getProps().id,
            );
            return this.updateFolderToRegisterdFolders(registerdfoldersWithSameFolder, folder);
        });

        if (Result.combine(yair).isFail()) return Result.fail();

        const snir = yair.flatMap((x) => { // azarzar help
            const y = x.value();
            if (y) return y;
        });

        return Result.Ok(snir);
    }

    updateFolderToRegisterdFolders(registerdFolders: RegisteredFolder[], folder: Folder) {
        const createRegisterdfoldersResult = registerdFolders.map((registerdFolder) => {
            const createRegisterdFolder = RegisteredFolder.getCreateFunctionByStatus(registerdFolder.getProps().status);
            return createRegisterdFolder({
                ...registerdFolder.getProps(),
                folder,
                lastValidPasswordTimestamp: Timestamp.now(),
            });
        });

        if (Result.combine(createRegisterdfoldersResult).isFail()) {
            this.logger.error('failed update folder to registerdFolders');
            return Result.fail();
        }

        return Result.Ok(createRegisterdfoldersResult.map((x) => x.value()));
    }
}

/* 
    #PSUDO:
      - user mutation folders interval
              get registerdFolders from repo by UPN,folderId
              update registration_timestamp on registerdFolders from repo by UPN,folderId
              return registerdFolders statuses

  */

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
