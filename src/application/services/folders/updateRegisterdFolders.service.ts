import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { uniqBy } from 'lodash';
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
        const unigedRegisterdFolders = this.getUniqedRegisteredFolders(filteredRegisteredFolders);
        const foldersFromAPIResult = await this.fetchFoldersFromAPI(unigedRegisterdFolders);
        if (foldersFromAPIResult.isFail()) {
            this.logger.error('failed to fetch folders from API by ids and passwords');
            return Result.fail();
        }

        const foldersFromAPI = foldersFromAPIResult.value();
        const newUpsertedregisteredFoldersResult = this.folderService.updateFoldersToRegisteredFolders(
            filteredRegisteredFolders,
            foldersFromAPI,
        );
        if (newUpsertedregisteredFoldersResult.isFail()) {
            this.logger.error('failed to update registeredFolders');

            return Result.fail();
        }

        const newUpsertedregisteredFolders = newUpsertedregisteredFoldersResult.value();
        if (newUpsertedregisteredFolders) {
            const upsertregisteredFoldersResult =
                await this.repository.upsertRegisteredFolders(newUpsertedregisteredFolders);
            if (upsertregisteredFoldersResult.isFail()) {
                this.logger.error('failed to  upsert registeredFolders to repo');
                return Result.fail();
            }

            return Result.Ok();
        }
    }

    private fetchFoldersFromAPI(registeredFolders: RegisteredFolder[]) {
        const folderIdsWithPasswords = registeredFolders.map((folder) => ({
            folderId: folder.getProps().folderId,
            password: folder.getProps().password,
        }));

        return this.romachApi.fetchFoldersByIdsAndPasswords(folderIdsWithPasswords);
    }

    private filterAlreadyUpdated(registeredFoldersFromRepo: RegisteredFolder[], basicFolders: BasicFolder[]) {
        const upsertedRegisteredFolders = registeredFoldersFromRepo.filter(
            (folder) =>
                basicFolders
                    .find((basicFolder) => folder.getProps().folderId == basicFolder.getProps().id)
                    .getProps().updatedAt === folder.getProps().updatedAtTimestamp,
        );

        return upsertedRegisteredFolders;
    }

    private getRegisteredFoldersByIds(basicFolders: BasicFolder[]) {
        const upsertedFoldersIds = basicFolders.map((folder) => folder.getProps().id);
        return this.repository.getRegisteredFoldersByIds(upsertedFoldersIds);
    }

    private getUniqedRegisteredFolders(registeredFolders: RegisteredFolder[]) {
        return uniqBy(registeredFolders, (item) => `${item.getProps().folderId}-${item.getProps().password}`);
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
