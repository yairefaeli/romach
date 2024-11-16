import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { filter, partition, pick, uniqBy } from 'lodash';
import { FoldersService } from './folders.service';
import { Result } from 'rich-domain';

export class UpdateRegisteredFoldersService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly folderService: FoldersService,
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly repository: RomachRepositoryInterface,
    ) { }

    async basicFolderUpdated(change: BasicFolderChange): Promise<Result<void>> {
        const res = await Promise.all([
            this.handleDeletedBasicFolders(change.deleted),
            this.handleUpsertedBasicFolders([...change.updated, ...change.inserted]),
        ]);

        if (Result.combine(res).isFail()) {
            return Result.fail();
        }

        return Result.Ok();
    }

    private async handleDeletedBasicFolders(deletedBasicFoldersIds: string[]): Promise<Result<void>> {
        const deletedResult = await this.repository.deleteRegisteredFoldersByIds(deletedBasicFoldersIds);
        if (deletedResult.isFail()) {
            this.logger.error('failed to delete registeredFolders from repo by ids');
            return Result.fail();
        }

        return Result.Ok();
    }

    private async handleUpsertedBasicFolders(upsertedBasicFolders: BasicFolder[]): Promise<Result<void>> {
        const registeredFoldersFromRepoResult = await this.getRegisteredFoldersByIds(upsertedBasicFolders);
        if (registeredFoldersFromRepoResult.isFail()) {
            this.logger.error('failed to get registeredFolders from repo by ids');
            return Result.fail();
        }

        const registeredFoldersFromRepo = registeredFoldersFromRepoResult.value();
        const filteredRegisteredFolders = this.filterAlreadyUpdated(registeredFoldersFromRepo, upsertedBasicFolders);
        const foldersFromAPIResult = await this.fetchFoldersFromAPI(filteredRegisteredFolders);
        if (Result.combine(foldersFromAPIResult).isFail()) {
            this.logger.error('failed to fetch folders from API by ids and passwords');
            return Result.fail();
        }

        const foldersFromAPI = foldersFromAPIResult.flatMap((x) => x.value());
        const newUpsertedRegisteredFoldersResult = this.folderService.updateFoldersToRegisteredFolders(
            filteredRegisteredFolders,
            foldersFromAPI,
        );
        if (newUpsertedRegisteredFoldersResult.isFail()) {
            this.logger.error('failed to update registeredFolders');

            return Result.fail();
        }

        const newUpsertedRegisteredFolders = newUpsertedRegisteredFoldersResult.value();
        if (newUpsertedRegisteredFolders) {
            const upsertRegisteredFoldersResult =
                await this.repository.upsertRegisteredFolders(newUpsertedRegisteredFolders);
            if (upsertRegisteredFoldersResult.isFail()) {
                this.logger.error('failed to  upsert registeredFolders to repo');
                return Result.fail();
            }

            return Result.Ok();
        }
    }

    private fetchFoldersFromAPI(upsertedRegisteredFolders: RegisteredFolder[]) {
        const nonUniquedFolders = uniqBy(
            upsertedRegisteredFolders,
            (item) => `${item.getProps().folderId}-${item.getProps().password}`,
        );

        const [passwordProtected, notPasswordProtected] = partition(
            nonUniquedFolders,
            (registeredFolder) => registeredFolder.getProps().isPasswordProtected,
        );

        const folderIdsWithPasswords = passwordProtected.map((folder) =>
            pick(folder.getProps(), ['folderId', 'password']),
        );
        const folderIdsWithoutPassword = notPasswordProtected.map((folder) => folder.getProps().folderId);

        const foldersFromAPIWithPassword = this.romachApi.fetchFoldersByIdsWithPassword(folderIdsWithPasswords); // azarzar - why to split with password or without
        const foldersFromAPIWithoutPassword = this.romachApi.fetchFoldersByIdsWithoutPassword(folderIdsWithoutPassword);

        return Promise.all([foldersFromAPIWithPassword, foldersFromAPIWithoutPassword]);
    }

    private filterAlreadyUpdated(registeredFoldersFromRepo: RegisteredFolder[], upsertedBasicFolders: BasicFolder[]) {
        const upsertedRegisteredFolders = registeredFoldersFromRepo.filter(
            (folder) =>
                upsertedBasicFolders
                    .find((basicFolder) => folder.getProps().folderId == basicFolder.getProps().id)
                    .getProps().updatedAt === folder.getProps().updatedAtTimestamp,
        );

        return upsertedRegisteredFolders;
    }

    private getRegisteredFoldersByIds(basicFolders: BasicFolder[]) {
        const upsertedFoldersIds = basicFolders.map((folder) => folder.getProps().id);
        return this.repository.getRegisteredFoldersByIds(upsertedFoldersIds);
    }
}

/*
    # PSUDO:
        - basic folder updated (inserted, updated, deleted)
            handle deleted
                remove deleted from repo by folderId
            handle updated and inserted
                get current registeredFolders from repo by folderId
                filter only lastUpdateTime is different - ?
                uniq by folderId, password
                fetch folders from API with folderIds, passwords
                on Success
                    update registeredFolder folder in repo by folderId, password
                on Fail
                    update registeredFolder's status=failed and content=null in repo by folderId, password
                registeredFolders with same folderId, password


    */
