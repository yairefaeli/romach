import { RegisteredFolderRepositoryInterface } from 'src/application/interfaces/registered-folders-repository/registered-folder-repository.interface';
import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entites-api/romach-entities-api.interface';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { RegisteredFoldersService } from '../registered-folders/registered-folders.service';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { keyBy, uniqBy } from 'lodash';
import { Result } from 'rich-domain';

interface UpdateRegisteredFoldersServiceOptions {
    logger: AppLoggerService;
    romachApi: RomachEntitiesApiInterface;
    registeredFoldersService: RegisteredFoldersService;
    registeredFolderRepositoryInterface: RegisteredFolderRepositoryInterface;
}

export class UpdateRegisteredFoldersService {
    constructor(private readonly options: UpdateRegisteredFoldersServiceOptions) {}

    async handleBasicFoldersChange(change: BasicFolderChange): Promise<Result> {
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
        const repositoryRegisteredFoldersResult =
            await this.getRepositoryRegisteredFoldersByBasicFolders(upsertedBasicFolders);

        if (repositoryRegisteredFoldersResult.isFail()) {
            this.options.logger.error('failed to get registeredFolders by ids from repo');
            return Result.fail();
        }

        const repositoryRegisteredFolders = repositoryRegisteredFoldersResult.value();

        const updatedRegisteredFolders = this.getUpdatedRegisteredFolders(
            repositoryRegisteredFolders,
            upsertedBasicFolders,
        );

        const uniqueRegisteredFolders = this.getUniqueRegisteredFolders(updatedRegisteredFolders);

        const apiFoldersResult = await this.fetchFoldersFromApi(uniqueRegisteredFolders);

        if (apiFoldersResult.isFail()) {
            this.options.logger.error('failed to fetch folders from API by ids and passwords');
            return Result.fail();
        }

        const upsertedRegisteredFoldersResult = this.options.registeredFoldersService.updateFoldersToRegisteredFolders(
            updatedRegisteredFolders,
            apiFoldersResult.value(),
        );

        if (upsertedRegisteredFoldersResult.isFail()) {
            this.options.logger.error('failed to update registeredFolders');

            return Result.fail();
        }

        const newUpsertedRegisteredFolders = upsertedRegisteredFoldersResult.value();
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

    private fetchFoldersFromApi(registeredFolders: RegisteredFolder[]) {
        const folderIdsWithPasswords = registeredFolders.map((folder) => ({
            folderId: folder.getProps().folderId,
            password: folder.getProps().password,
        }));

        return this.options.romachApi.fetchFoldersByIdsAndPasswords(folderIdsWithPasswords);
    }

    private getUpdatedRegisteredFolders(repositoryRegisteredFolders: RegisteredFolder[], basicFolders: BasicFolder[]) {
        const basicFoldersById = keyBy(basicFolders, (basicFolder) => basicFolder.getProps().id);

        return repositoryRegisteredFolders.filter(
            (registeredFolder) =>
                basicFoldersById[registeredFolder.getProps().folderId].getProps().updatedAt !==
                registeredFolder.getProps().updatedAtTimestamp,
        );
    }

    private getRepositoryRegisteredFoldersByBasicFolders(basicFolders: BasicFolder[]) {
        const upsertedFoldersIds = basicFolders.map((folder) => folder.getProps().id);
        return this.options.registeredFolderRepositoryInterface.getRegisteredFoldersByIds(upsertedFoldersIds);
    }

    private getUniqueRegisteredFolders(registeredFolders: RegisteredFolder[]) {
        return uniqBy(registeredFolders, (item) => `${item.getProps().folderId}-${item.getProps().password}`);
    }
}
