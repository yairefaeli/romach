import { RegisteredFolderRepositoryInterface } from '../../../interfaces/registered-folders-repository/registered-folder-repository.interface';
import { RegisteredFolder, RegisteredFolderProps } from '../../../../domain/entities/RegisteredFolder';
import { RegisteredFolderErrorStatus } from '../../../../domain/entities/RegisteredFolderTypes';
import { AppLoggerService } from '../../../../infra/logging/app-logger.service';
import { ResultUtils } from '../../../../utils/ResultUtils/ResultUtils';
import { Timestamp } from '../../../../domain/entities/Timestamp';
import { Folder } from '../../../../domain/entities/folder';
import { Result } from 'rich-domain';
import { keyBy } from 'lodash';

interface RegisteredFoldersServiceOptions {
    logger: AppLoggerService;
    registeredFoldersRepository: RegisteredFolderRepositoryInterface;
}

export class RegisteredFoldersService {
    constructor(private readonly options: RegisteredFoldersServiceOptions) {}

    public async upsertGeneralError(
        registeredFolderData: Pick<RegisteredFolderProps, 'upn' | 'password' | 'folderId' | 'isPasswordProtected'>,
    ): Promise<Result<void, RegisteredFolderErrorStatus>> {
        const input = {
            ...registeredFolderData,
            lastValidPasswordTimestamp: null,
        };

        const newRegisteredFolderResult = RegisteredFolder.createGeneralErrorRegisteredFolder(input);

        if (newRegisteredFolderResult.isFail()) {
            this.options.logger.error(`Failed to create new registered folder (${newRegisteredFolderResult.error()})`);
            return Result.fail('general-error');
        }

        const newRegisteredFolder = newRegisteredFolderResult.value();

        const upsertFolderResult =
            await this.options.registeredFoldersRepository.upsertRegisteredFolder(newRegisteredFolder);

        if (upsertFolderResult.isFail()) {
            this.options.logger.error('Failed to upsert registered folder to repository');
            return Result.fail('general-error');
        }

        return Result.Ok() as Result<void, RegisteredFolderErrorStatus>;
    }

    public async upsertValid(
        upn: string,
        folderId: string,
        folder: Folder,
        password?: string,
    ): Promise<Result<void, RegisteredFolderErrorStatus>> {
        const registeredFoldersResult =
            await this.options.registeredFoldersRepository.getRegisteredFoldersByIdAndPassword(folderId, password);

        const currentRegisteredFolders = registeredFoldersResult.value();

        if (!currentRegisteredFolders) {
            this.options.logger.error('failed to get registeredFolders with same folderId and password');
            return Result.fail('general-error');
        }

        const changedValidRegisteredFoldersResult = this.updateFoldersToRegisteredFolders(currentRegisteredFolders, [
            folder,
        ]);
        if (changedValidRegisteredFoldersResult.isFail()) {
            this.options.logger.error('failed to update registeredFolders');
            return Result.fail('general-error');
        }

        const newRegisteredFolderResult = RegisteredFolder.createValidRegisteredFolder({
            upn,
            folder,
            password,
            lastValidPasswordTimestamp: Timestamp.now(),
        });

        if (newRegisteredFolderResult.isFail()) {
            this.options.logger.error('failed to create new registeredFolder');
            return Result.fail('general-error');
        }

        const newRegisteredFolder = newRegisteredFolderResult.value();
        const updatedRegisteredFolders = changedValidRegisteredFoldersResult.value();
        if (!updatedRegisteredFolders) {
            return Result.fail('general-error');
        }

        const upsertFolderResult = await this.options.registeredFoldersRepository.upsertRegisteredFolders([
            newRegisteredFolder,
            ...updatedRegisteredFolders,
        ]);

        if (upsertFolderResult.isFail()) {
            this.options.logger.error('failed to upsert registeredFolder to repo');
            return Result.fail('general-error');
        }

        return Result.Ok() as Result<void, RegisteredFolderErrorStatus>;
    }

    public async upsertWrongPassword(
        upn: string,
        folderId: string,
    ): Promise<Result<Folder | void, RegisteredFolderErrorStatus>> {
        const currentRegisteredFoldersResult =
            await this.options.registeredFoldersRepository.getRegisteredFoldersById(folderId);

        const currentRegisteredFolders = currentRegisteredFoldersResult.value();

        if (!currentRegisteredFolders) return Result.fail('general-error');

        const newRegisteredFolderResult = RegisteredFolder.createWrongPasswordRegisteredFolder({
            upn,
            folderId,
        });

        const newRegisteredFolder = newRegisteredFolderResult.value();

        this.options.logger.error('failed to create new registeredFolder');

        if (!newRegisteredFolder) {
            return Result.fail('general-error');
        }

        const changedRegisteredFoldersResult = RegisteredFolder.changeStatusToRegisteredFolders(
            currentRegisteredFolders,
            'wrong-password',
        );

        const changedRegisteredFolders = changedRegisteredFoldersResult.value();

        if (!changedRegisteredFolders) {
            return Result.fail('general-error');
        }

        const allRegisteredFoldersToUpsert = [...changedRegisteredFolders, newRegisteredFolder];

        const upsertFolderResult =
            await this.options.registeredFoldersRepository.upsertRegisteredFolders(allRegisteredFoldersToUpsert);

        if (upsertFolderResult.isFail()) {
            this.options.logger.error('failed to upsert registeredFolder to repo');
            return Result.fail('general-error');
        }

        return Result.Ok() as Result<void, RegisteredFolderErrorStatus>;
    }

    public updateFoldersToRegisteredFolders(registeredFolders: RegisteredFolder[], folders: Folder[]) {
        const foldersById = keyBy(folders, (folder) => folder.getProps().basicFolder.getProps().id);

        const updatedRegisteredFoldersResult = registeredFolders.map((registeredFolder) =>
            registeredFolder.updateFolder(foldersById[registeredFolder.getProps().folderId]),
        );

        if (Result.combine(updatedRegisteredFoldersResult).isFail()) return Result.fail();

        const newRegisteredFolders = ResultUtils.resultsToValues(updatedRegisteredFoldersResult);

        return Result.Ok(newRegisteredFolders);
    }
}
