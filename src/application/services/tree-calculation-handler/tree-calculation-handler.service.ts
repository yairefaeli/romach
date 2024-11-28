import { HierarchiesRepositoryInterface } from '../../interfaces/hierarchies-interface/hierarchies.interface';
import { TreeCalculationService } from '../../../domain/services/tree-calculation/tree-calculation.service';
import { BasicFoldersRepositoryInterface } from '../../interfaces/basic-folder/basic-folder.interface';
import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { RetryUtils } from '../../../utils/RetryUtils/RetryUtils';
import { Hierarchy } from '../../../domain/entities/hierarchy';
import { isEmpty, isEqual, keyBy } from 'lodash';
import { Result } from 'rich-domain';

export interface TreeCalculationHandlerServiceOptions {
    maxRetry: number;
    logger: AppLoggerService;
    basicFolderRepositoryInterface: BasicFoldersRepositoryInterface;
    hierarchiesRepositoryInterface: HierarchiesRepositoryInterface;
    treeCalculationService: TreeCalculationService;
}

export class TreeCalculationHandlerService {
    constructor(private options: TreeCalculationHandlerServiceOptions) {}

    async execute(changes: BasicFolderChange): Promise<Result> {
        const currentFoldersFromRepositoryResult = await this.getCurrentFoldersFromRepository();

        if (currentFoldersFromRepositoryResult.isFail()) {
            this.options.logger.error(
                `Failed to fetch current folders from repository: ${currentFoldersFromRepositoryResult.error()}`,
            );
            return Result.fail();
        }

        const currentFolders = currentFoldersFromRepositoryResult.value();

        const updatedFolders = this.getUpdatedFolders(currentFolders, changes.updated);

        if (this.needToCalcTree({ ...changes, updated: updatedFolders })) {
            const currentHierarchiesFromRepositoryResult = await this.getCurrentHierarchiesFromRepository();

            if (currentHierarchiesFromRepositoryResult.isFail()) {
                this.options.logger.error(
                    `Failed to fetch current hierarchies from repository: ${currentHierarchiesFromRepositoryResult.error()}`,
                );
                return Result.fail();
            }

            const currentHierarchies = currentHierarchiesFromRepositoryResult.value();

            const upsertedFolders = this.mergeFolders(currentFolders, { ...changes, updated: updatedFolders });
            const treeCalculationResult = await this.calculateTree(upsertedFolders, currentHierarchies);

            if (treeCalculationResult.isFail()) {
                this.options.logger.error(`Failed to calculate tree: ${treeCalculationResult.error()}`);
                return Result.fail();
            }
        }

        return Result.Ok();
    }

    private mergeFolders(
        currentFoldersFromRepository: BasicFolder[],
        changedFolders: BasicFolderChange,
    ): BasicFolder[] {
        const { deleted: deletedFolderIds, inserted: insertedFolders, updated: updatedFolders } = changedFolders;

        //filter from the current folders that get from repository the deleted folders
        const folderFromRepositoyWithoutDeletedFolders = currentFoldersFromRepository.filter(
            (folder) =>
                !deletedFolderIds.includes(folder.getProps().id) &&
                !updatedFolders.find((updatedFolders) => updatedFolders.getProps().id === folder.getProps().id),
        );

        // get the final result of the folders that need to send to calculate tree function
        const resultFolders = [...folderFromRepositoyWithoutDeletedFolders, ...insertedFolders, ...updatedFolders];

        this.options.logger.info(`Filtered folders for tree calculation: ${resultFolders.length} folders.`);
        return resultFolders;
    }

    private getUpdatedFolders(
        currentFoldersFromRepository: BasicFolder[],
        changes: BasicFolderChange['updated'],
    ): BasicFolder[] {
        const folderFromRepositoryById = keyBy(currentFoldersFromRepository, (folder) => folder.getProps().id);
        return changes.filter((folder) => {
            const folderFromRepository = folderFromRepositoryById[folder.getProps().id];
            return !isEqual(
                folderFromRepository?.getProps().categoryId,
                folder.getProps().categoryId || !isEqual(folderFromRepository?.getProps().name, folder.getProps().name),
            );
        });
    }

    private needToCalcTree(changes: BasicFolderChange): boolean {
        return !Object.values(changes).every(isEmpty);
    }

    private async getCurrentFoldersFromRepository(): Promise<Result<BasicFolder[]>> {
        return RetryUtils.retry(
            async () => {
                const result = await this.options.basicFolderRepositoryInterface.getBasicFolders();
                if (result.isFail()) {
                    return Result.fail(`Failed to fetch current folders from repository: ${result.error()}`);
                }
                this.options.logger.info(`Fetched ${result.value().length} current folders from repository.`);
                return result;
            },
            this.options.maxRetry,
            this.options.logger,
        );
    }

    private async getCurrentHierarchiesFromRepository(): Promise<Result<Hierarchy[]>> {
        return RetryUtils.retry(
            async () => {
                const result = await this.options.hierarchiesRepositoryInterface.getHierarchies();
                if (result.isFail()) {
                    return Result.fail(`Failed to fetch current hierarchies from repository: ${result.error()}`);
                }
                this.options.logger.info(`Fetched ${result.value().length} current hierarchies from repository.`);
                return result;
            },
            this.options.maxRetry,
            this.options.logger,
        );
    }

    private async calculateTree(currentFolders: BasicFolder[], currentHierarchies: Hierarchy[]): Promise<Result<void>> {
        this.options.logger.debug('Starting tree calculation');
        try {
            await RetryUtils.retry(
                async () => {
                    this.options.treeCalculationService.calculateTree(currentFolders, currentHierarchies);
                    return Result.Ok();
                },
                this.options.maxRetry,
                this.options.logger,
            );
            this.options.logger.info('Tree calculation completed successfully.');
            return Result.Ok();
        } catch (error) {
            this.options.logger.error(`Error calculating tree: ${error.message}`);
            return Result.fail(`Tree calculation failed: ${error.message}`);
        }
    }
}
