import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entites-api/romach-entities-api.interface';
import { RegisteredFolderRepositoryInterface } from 'src/application/interfaces/regsitered-folder-interface';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { RegisteredFoldersService } from '../registered-folders.service';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Result } from 'rich-domain';
import { uniqBy } from 'lodash';

interface UpdateRegisteredFoldersServiceOptions {
    logger: AppLoggerService;
    romachApi: RomachEntitiesApiInterface;
    folderService: RegisteredFoldersService;
    registeredFolderRepositoryInterface: RegisteredFolderRepositoryInterface;
}

export class UpdateRegisteredFoldersService {
    constructor(private readonly options: UpdateRegisteredFoldersServiceOptions) {}

    async basicFolderUpdated(change: BasicFolderChange): Promise<Result> {
        const res = await Promise.all([
            this.handleDeletedBasicFolders(change.deleted),
            this.handleUpsertedBasicFolders([...change.updated, ...change.inserted]),
        ]);

        if (Result.combine(res).isFail()) {
            return Result.fail();
        }

        return Result.Ok();
    }

    private async handleDeletedBasicFolders(deletedBasicFoldersIds: string[]): Promise<Result> {
        const deletedResult =
            await this.options.registeredFolderRepositoryInterface.deleteRegisteredFoldersByIds(deletedBasicFoldersIds);

        if (deletedResult.isFail()) {
            this.options.logger.error('failed to delete registeredFolders from repo by ids');
            return Result.fail();
        }

        return Result.Ok();
    }

    private async handleUpsertedBasicFolders(upsertedBasicFolders: BasicFolder[]): Promise<Result> {
        const registeredFoldersFromRepoResult = await this.getRegisteredFoldersByIds(upsertedBasicFolders);

        if (registeredFoldersFromRepoResult.isFail()) {
            this.options.logger.error('failed to get registeredFolders from repo by ids');
            return Result.fail();
        }

        const registeredFoldersFromRepo = registeredFoldersFromRepoResult.value();

        const filteredRegisteredFolders = this.filterAlreadyUpdated(registeredFoldersFromRepo, upsertedBasicFolders);

        const uniqueRegisteredFolders = this.getUniqedRegisteredFolders(filteredRegisteredFolders);

        const foldersFromAPIResult = await this.fetchFoldersFromAPI(uniqueRegisteredFolders);

        if (foldersFromAPIResult.isFail()) {
            this.options.logger.error('failed to fetch folders from API by ids and passwords');
            return Result.fail();
        }

        const foldersFromAPI = foldersFromAPIResult.value();
        const newUpsertedRegisteredFoldersResult = this.options.folderService.updateFoldersToRegisteredFolders(
            filteredRegisteredFolders,
            foldersFromAPI,
        );
        if (newUpsertedRegisteredFoldersResult.isFail()) {
            this.options.logger.error('failed to update registeredFolders');

            return Result.fail();
        }

        const newUpsertedRegisteredFolders = newUpsertedRegisteredFoldersResult.value();
        if (newUpsertedRegisteredFolders) {
            const upsertRegisteredFoldersResult =
                await this.options.registeredFolderRepositoryInterface.upsertRegisteredFolders(
                    newUpsertedRegisteredFolders,
                );
            if (upsertRegisteredFoldersResult.isFail()) {
                this.options.logger.error('failed to  upsert registeredFolders to repo');
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

        return this.options.romachApi.fetchFoldersByIdsAndPasswords(folderIdsWithPasswords);
    }

    private filterAlreadyUpdated(registeredFoldersFromRepo: RegisteredFolder[], basicFolders: BasicFolder[]) {
        return registeredFoldersFromRepo.filter(
            (folder) =>
                basicFolders.find((basicFolder) => folder.getProps().folderId == basicFolder.getProps().id).getProps()
                    .updatedAt === folder.getProps().updatedAtTimestamp,
        );
    }

    private getRegisteredFoldersByIds(basicFolders: BasicFolder[]) {
        const upsertedFoldersIds = basicFolders.map((folder) => folder.getProps().id);
        return this.options.registeredFolderRepositoryInterface.getRegisteredFoldersByIds(upsertedFoldersIds);
    }

    private getUniqedRegisteredFolders(registeredFolders: RegisteredFolder[]) {
        return uniqBy(registeredFolders, (item) => `${item.getProps().folderId}-${item.getProps().password}`);
    }
}
