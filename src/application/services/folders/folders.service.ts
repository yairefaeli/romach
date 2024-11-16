import { RegisteredFolderErrorStatus, RegisteredFolderStatus } from 'src/domain/entities/RegisteredFolderStatus';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Folder } from 'src/domain/entities/Folder';
import { filter } from 'lodash';
import { Result } from 'rich-domain';

export class FoldersService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly repository: RomachRepositoryInterface,
    ) { }

    async upsertGeneralError(
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

    async upsertValid(
        upn: string,
        folderId: string,
        folder: Folder,
        password?: string,
    ): Promise<Result<Folder | void, RegisteredFolderErrorStatus>> {
        const registeredFoldersResult = await this.repository.getRegisteredFoldersByIdAndPassword(folderId, password);
        const currentRegisteredFolders = registeredFoldersResult.value();
        if (!currentRegisteredFolders) {
            this.logger.error('failed to get registeredFolders with same folderId and password');
            return Result.fail('general-error');
        }
        const changedValidRegisteredFoldersResult = this.updateFolderToRegisteredFolders(
            currentRegisteredFolders,
            folder,
        );
        if (changedValidRegisteredFoldersResult.isFail()) {
            this.logger.error('failed to update registeredFolders');
            return Result.fail('general-error');
        }

        const newRegisteredFolderResult = RegisteredFolder.createValidRegisteredFolder({
            upn,
            folder,
            password,
            lastValidPasswordTimestamp: Timestamp.now(),
        });
        if (newRegisteredFolderResult.isFail()) {
            this.logger.error('failed to create new registeredFolder');
            return Result.fail('general-error');
        }

        const newRegisteredFolder = newRegisteredFolderResult.value();
        const updatedRegisteredFolders = changedValidRegisteredFoldersResult.value();
        if (updatedRegisteredFolders) {
            const upsertFolderResult = await this.repository.upsertRegisteredFolders([
                newRegisteredFolder,
                ...updatedRegisteredFolders,
            ]);
            if (upsertFolderResult.isFail()) {
                this.logger.error('failed to upsert registeredFolder to repo');
                return Result.fail('general-error');
            }
        }

        return Result.Ok(folder);
    }

    async upsertWrongPassword(
        upn: string,
        folderId: string,
    ): Promise<Result<Folder | void, RegisteredFolderErrorStatus>> {
        const currentRegisteredFoldersResult = await this.repository.getRegisteredFoldersById(folderId);
        const currentRegisteredFolders = currentRegisteredFoldersResult.value();
        if (!currentRegisteredFolders) return Result.fail('general-error');

        const newRegisteredFolderResult = RegisteredFolder.createWrongPasswordRegisteredFolder({
            upn,
            folderId,
        });
        const newRegisteredFolder = newRegisteredFolderResult.value();
        this.logger.error('failed to create new registeredFolder');
        if (!newRegisteredFolder) return Result.fail('general-error');

        const changedRegisteredFoldersResult = this.changeStatusToRegisteredFolders(
            currentRegisteredFolders,
            'wrong-password',
        );
        const changedRegisteredFolders = changedRegisteredFoldersResult.value();
        if (!changedRegisteredFolders) return Result.fail('general-error');

        const allRegisteredFoldersToUpsert = [...changedRegisteredFolders, newRegisteredFolder];
        const upsertFolderResult = await this.repository.upsertRegisteredFolders(allRegisteredFoldersToUpsert);
        if (upsertFolderResult.isFail()) {
            this.logger.error('failed to upsert registeredFolder to repo');
            return Result.fail('general-error');
        }

        // return Result.Ok();
    }

    private changeStatusToRegisteredFolders(registeredFolders: RegisteredFolder[], newStatus: RegisteredFolderStatus) {
        const createRegisteredFolder = RegisteredFolder.getCreateFunctionByStatus(newStatus);

        const createRegisteredFoldersResult = registeredFolders.map((registeredFolder) =>
            createRegisteredFolder({
                ...registeredFolder.getProps(),
                lastValidPasswordTimestamp: newStatus === 'valid' ? Timestamp.now() : null,
            }),
        );

        if (Result.combine(createRegisteredFoldersResult).isFail()) {
            this.logger.error('failed to change status to registeredFolders');
            return Result.fail();
        }

        return Result.Ok(createRegisteredFoldersResult.map((x) => x.value()));
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
        const createRegisteredFoldersResult = registeredFolders.map((registeredFolder) => {
            const createRegisteredFolder = RegisteredFolder.getCreateFunctionByStatus(
                registeredFolder.getProps().status,
            );
            return createRegisteredFolder({
                ...registeredFolder.getProps(),
                folder,
                lastValidPasswordTimestamp: Timestamp.now(),
            });
        });

        if (Result.combine(createRegisteredFoldersResult).isFail()) {
            this.logger.error('failed update folder to registeredFolders');
            return Result.fail();
        }

        return Result.Ok(createRegisteredFoldersResult.map((x) => x.value()));
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
