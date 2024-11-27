import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entites-api/romach-entities-api.interface';
import { RegisteredFolderRepositoryInterface } from 'src/application/interfaces/regsitered-folder-interface';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { RegisteredFoldersService } from './registered-folders.service';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Result } from 'rich-domain';
import { uniqBy } from 'lodash';

export class UpdateRegisteredFoldersService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly folderService: RegisteredFoldersService,
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly registeredFolderRepositoryInterface: RegisteredFolderRepositoryInterface,
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
        const deletedResult =
            await this.registeredFolderRepositoryInterface.deleteRegisteredFoldersByIds(deletedBasicFoldersIds);

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
                await this.registeredFolderRepositoryInterface.upsertRegisteredFolders(newUpsertedregisteredFolders);
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
                basicFolders.find((basicFolder) => folder.getProps().folderId == basicFolder.getProps().id).getProps()
                    .updatedAt === folder.getProps().updatedAtTimestamp,
        );

        return upsertedRegisteredFolders;
    }

    private getRegisteredFoldersByIds(basicFolders: BasicFolder[]) {
        const upsertedFoldersIds = basicFolders.map((folder) => folder.getProps().id);
        return this.registeredFolderRepositoryInterface.getRegisteredFoldersByIds(upsertedFoldersIds);
    }

    private getUniqedRegisteredFolders(registeredFolders: RegisteredFolder[]) {
        return uniqBy(registeredFolders, (item) => `${item.getProps().folderId}-${item.getProps().password}`);
    }
}
