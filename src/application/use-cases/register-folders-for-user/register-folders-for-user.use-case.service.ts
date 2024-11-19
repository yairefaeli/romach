import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { isEmpty, partition } from 'lodash';
import { RetryUtils } from 'src/utils/RetryUtils/RetryUtils';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { Result } from 'rich-domain';
import { UPN } from 'src/domain/entities/UPN';

export interface RegisterFoldersForUserOption {
    maxRetry: number;
    logger: AppLoggerService;
    repository: RomachRepositoryInterface;
}


export interface RegisterFoldersForUserInput {
    reality: RealityId;
    upn: string;
    folderIds: string[];
}

export class RegisterFoldersForUserUseCase {
    constructor(private options: RegisterFoldersForUserOption) { }

    async execute(registerFoldersForUserInput: RegisterFoldersForUserInput): Promise<Result<void>> {
        this.options.logger.info(`Starting folder registration process for user ${registerFoldersForUserInput.upn}`);

        const { upn, folderIds } = registerFoldersForUserInput;

        const registeredFoldersResult = await this.getRegisteredFolders(upn);

        if (registeredFoldersResult.isFail()) {
            return Result.fail(`Failed to fetch registered folders for user ${upn}`);
        }

        const { relevantFolders, irrelevantFolders } = this.partitionFolders(
            registeredFoldersResult.value(),
            folderIds,
        );

        const deleteResult = await this.deleteIrrelevantFolders(irrelevantFolders, upn);
        if (deleteResult.isFail()) {
            return Result.fail(deleteResult.error());
        }

        const updateResult = await this.updateRelevantFolders(relevantFolders, upn);
        if (updateResult.isFail()) {
            return Result.fail(updateResult.error());
        }

        this.options.logger.info(`Folder registration process completed for user ${registerFoldersForUserInput.upn}`);
        return Result.Ok();
    }

    private async getRegisteredFolders(upn: UPN): Promise<Result<RegisteredFolder[]>> {
        this.options.logger.debug(`Fetching registered folders for user ${upn}`);
        const result = await RetryUtils.retry(
            () => this.options.repository.getRegisteredFoldersByUpn(upn),
            this.options.maxRetry,
            this.options.logger,
        );

        if (result.isFail()) {
            this.options.logger.error(`Failed to fetch registered folders for user ${upn}`);
            return Result.fail(`Failed to fetch registered folders for user ${upn}`);
        }

        this.options.logger.debug(`Fetched ${result.value().length} registered folders for user ${upn}`);
        return Result.Ok(result.value());
    }

    private partitionFolders(registeredFolders: RegisteredFolder[], folderIds: string[]) {
        this.options.logger.debug(`Partitioning folders into relevant and irrelevant groups`);
        const [relevantFolders, irrelevantFolders] = partition(
            registeredFolders,
            (folder) => folderIds.includes(folder.getProps().folderId),
        );

        this.options.logger.debug(
            `Partitioned folders: ${relevantFolders.length} relevant, ${irrelevantFolders.length} irrelevant`,
        );

        return { relevantFolders, irrelevantFolders };
    }

    private async deleteIrrelevantFolders(folders: RegisteredFolder[], upn: string): Promise<Result<void>> {
        if (isEmpty(folders)) {
            this.options.logger.debug(`No irrelevant folders to delete for user ${upn}`);
            return Result.Ok();
        }

        const folderIds = folders.map((folder) => folder.getProps().folderId);

        this.options.logger.info(`Deleting ${folders.length} irrelevant folders for user ${upn}`);
        const result = await RetryUtils.retry(
            () => this.options.repository.deleteRegisteredFoldersByIdsForUpn(folderIds, upn),
            this.options.maxRetry,
            this.options.logger,
        );

        if (result.isFail()) {
            this.options.logger.error(`Failed to delete irrelevant folders for user ${upn}`);
            return Result.fail(result.error());
        }

        this.options.logger.debug(`Deleted irrelevant folders for user ${upn}`);
        return Result.Ok();
    }

    private async updateRelevantFolders(folders: RegisteredFolder[], upn: string): Promise<Result<void>> {
        if (isEmpty(folders)) {
            this.options.logger.debug(`No relevant folders to update for user ${upn}`);
            return Result.Ok();
        }

        const folderIds = folders.map((folder) => folder.getProps().folderId);

        this.options.logger.info(`Updating registration timestamps for ${folders.length} folders for user ${upn}`);
        const result = await RetryUtils.retry(
            () => this.options.repository.updateRegistrationByUpnAndFolderIds(folderIds, upn),
            this.options.maxRetry,
            this.options.logger,
        );

        if (result.isFail()) {
            this.options.logger.error(`Failed to update registration timestamps for user ${upn}`);
            return Result.fail(result.error());
        }

        this.options.logger.debug(`Updated registration timestamps for user ${upn}`);
        return Result.Ok();
    }
}
