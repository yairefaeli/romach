import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { Result } from 'rich-domain';
import { uniqBy } from 'lodash';

export class UpdateRegisterdFoldersService {
    constructor(
        private readonly logger: AppLoggerService,
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

    private async handleUpsertedBasicFolders(upsartedBasicFolders: BasicFolder[]): Promise<Result<void>> {
        const upsertedFoldersIds = upsartedBasicFolders.map((folder) => folder.getProps().id);
        const registerdFoldersFromRepoResult = await this.repository.getRegisteredFoldersByIds(upsertedFoldersIds);
        if (registerdFoldersFromRepoResult.isFail()) {
            this.logger.error('faild get registerdFolders from repo by ids');
            return Result.fail();
        }
        
        const registerdFoldersFromRepo = registerdFoldersFromRepoResult.value();
        const filteredRegisterdFolders = this.filterAlreadyUpdated(registerdFoldersFromRepo, upsartedBasicFolders);
        const foldersFromAPIResult = await this.fetchFoldersFromAPI(registerdFoldersFromRepo);
        if (foldersFromAPIResult.isFail()) {
            this.logger.error('failed fetch folders from API by ids and passwords');
            return Result.fail();
        }

        const foldersFromAPI = foldersFromAPIResult.value();
        const newUpsertedRegisterdFoldersResults = filteredRegisterdFolders.map((registerdFolder) => {
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
        const upsertRegisterdFoldersResult = await this.repository.upsertRegisteredFolders([
            newUpsertedRegisterdFolders,
        ]);
        if (upsertRegisterdFoldersResult.isFail()) {
            this.logger.error('faild upsert registerdFolders to repo');
            return Result.fail();
        }

        return Result.Ok();
    }

    private async fetchFoldersFromAPI(upsertedRegisterdFolders: RegisteredFolder[]) {
        const folderIdsAndPasswords = this.transformFoldersToInput(upsertedRegisterdFolders);
        const foldersFromAPIResult = await this.romachApi.getFoldersByIds(folderIdsAndPasswords); // what happend if one of the folders have wrong password? do i need to check that?

        return foldersFromAPIResult;
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
}

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
