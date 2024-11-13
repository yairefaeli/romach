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

export class UpdateRegisterdFoldersService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly folderService: FoldersService,
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly repository: RomachRepositoryInterface,
    ) {}

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
        const deletedResult = await this.repository.deleteRegisterdFoldersByIds(deletedBasicFoldersIds);
        if (deletedResult.isFail()) {
            this.logger.error('failed delete registerdFolders from repo by ids');
            return Result.fail();
        }

        return Result.Ok();
    }

    private async handleUpsertedBasicFolders(upsertedBasicFolders: BasicFolder[]): Promise<Result<void>> {
        const registerdFoldersFromRepoResult = await this.getRegisteredFoldersByIds(upsertedBasicFolders);
        if (registerdFoldersFromRepoResult.isFail()) {
            this.logger.error('faild get registerdFolders from repo by ids');
            return Result.fail();
        }

        const registerdFoldersFromRepo = registerdFoldersFromRepoResult.value();
        const filteredRegisterdFolders = this.filterAlreadyUpdated(registerdFoldersFromRepo, upsertedBasicFolders);
        const foldersFromAPIResult = await this.fetchFoldersFromAPI(filteredRegisterdFolders);
        if (Result.combine(foldersFromAPIResult).isFail()) {
            this.logger.error('failed fetch folders from API by ids and passwords');
            return Result.fail();
        }

        const foldersFromAPI = foldersFromAPIResult.flatMap((x) => x.value());
        const newUpsertedRegisterdFoldersResult = this.folderService.updateFoldersToRegisterdFolders(
            filteredRegisterdFolders,
            foldersFromAPI,
        );
        if (newUpsertedRegisterdFoldersResult.isFail()) {
            this.logger.error('failed update registerdFolders');

            return Result.fail();
        }

        const newUpsertedRegisterdFolders = newUpsertedRegisterdFoldersResult.value();
        if (newUpsertedRegisterdFolders) {
            const upsertRegisterdFoldersResult =
                await this.repository.upsertRegisteredFolders(newUpsertedRegisterdFolders);
            if (upsertRegisterdFoldersResult.isFail()) {
                this.logger.error('faild upsert registerdFolders to repo');
                return Result.fail();
            }

            return Result.Ok();
        }
    }

    private fetchFoldersFromAPI(upsertedRegisterdFolders: RegisteredFolder[]) {
        const nonUniquedFolders = uniqBy(
            upsertedRegisterdFolders,
            (item) => `${item.getProps().folderId}-${item.getProps().password}`,
        );

        const [passwordProtected, notPasswordProtected] = partition(
            nonUniquedFolders,
            (registerdFolder) => registerdFolder.getProps().isPasswordProtected,
        );

        const folderIdsWithPasswords = passwordProtected.map((folder) =>
            pick(folder.getProps(), ['folderId', 'password']),
        );
        const folderIdsWithoutPassword = notPasswordProtected.map((folder) => folder.getProps().folderId);

        const foldersFromAPIwithPassword = this.romachApi.getFoldersByIdWithPassword(folderIdsWithPasswords); // azarzar - why to split with password or without
        const foldersFromAPIWithoutPassword = this.romachApi.getFoldersByIdWithoutPassword(folderIdsWithoutPassword);

        return Promise.all([foldersFromAPIwithPassword, foldersFromAPIWithoutPassword]);
    }

    private filterAlreadyUpdated(registerdFoldersFromRepo: RegisteredFolder[], upsartedBasicFolders: BasicFolder[]) {
        const upsertedRegisterdFolders = registerdFoldersFromRepo.filter(
            (folder) =>
                upsartedBasicFolders
                    .find((basicFolder) => folder.getProps().folderId == basicFolder.getProps().id)
                    .getProps().updatedAt === folder.getProps().updatedAtTimestamp,
        );

        return upsertedRegisterdFolders;
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
                get current registerdFolders from repo by folderId
                filter only lastUpdateTime is different - ?
                uniq by folderId, password
                fetch folders from API with folderIds, passwords
                on Success
                    update registerdFolder folder in repo by folderId, password
                on Fail
                    update registerdFolder's status=failed and content=null in repo by folderId, password
                registerdFolders with same folderId, password


    */
