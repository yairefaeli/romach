import { Result } from 'rich-domain';
import { isEmpty, isEqual } from 'lodash';
import { TreeCalculationService } from 'src/domain/services/tree-calculation/tree-calculation.service';
import { RetryUtils } from 'src/utils/RetryUtils/RetryUtils';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Hierarchy } from 'src/domain/entities/Hierarchy';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { BasicFolderChange } from 'src/application/interfaces/basic-folder-changes.interface';
import { RomachEntitiesApiInterface } from 'src/application/interfaces/romach-entities-api.interface';

export interface TreeCalculationHandlerServiceOptions {
    maxRetry: number
    logger: AppLoggerService,
    romachRepository: RomachRepositoryInterface,
    treeCalculationService: TreeCalculationService,
    romachEntitiesApiInterface: RomachEntitiesApiInterface,
}

export class TreeCalculationHandlerService {
    constructor(private options: TreeCalculationHandlerServiceOptions) { }

    async execute(changes: BasicFolderChange): Promise<Result<void>> {
        const currentFoldersFromRepositoryResult = await this.getCurrentFoldersFromRepository();

        if (currentFoldersFromRepositoryResult.isFail()) {
            this.options.logger.error(`Failed to fetch current folders from repository: ${currentFoldersFromRepositoryResult.error()}`);
            return Result.fail();
        }

        const currentFolders = currentFoldersFromRepositoryResult.value();

        if (this.needToCalcTree(currentFolders, changes)) {
            const currentHierarchiesFromRepositoryResult = await this.getCurrentHierarchiesFromRepository();

            if (currentHierarchiesFromRepositoryResult.isFail()) {
                this.options.logger.error(`Failed to fetch current hierarchies from repository: ${currentHierarchiesFromRepositoryResult.error()}`);
                return Result.fail();
            }
            const currentHierarchies = currentHierarchiesFromRepositoryResult.value();

            const updatedFolders = this.mergeFolders(currentFolders, changes);
            const treeCalculationResult = await this.calculateTree(updatedFolders, currentHierarchies);

            if (treeCalculationResult.isFail()) {
                this.options.logger.error(`Failed to calculate tree: ${treeCalculationResult.error()}`);
                return Result.fail();
            }

        }

        return Result.Ok();
    }

    private mergeFolders(currentFoldersFromRepository: BasicFolder[], changedFolders: BasicFolderChange): BasicFolder[] {
        const { deleted: deletedFolderIds, inserted: insertedFolders, updated: updatedFolders } = changedFolders;

        //filter from the current folders that get from repository the deleted folders
        const folderFromRepositoyWithoutDeletedFolders = currentFoldersFromRepository.filter(
            folder => !deletedFolderIds.includes(folder.getProps().id),
        );

        //filter from the current folders the folders that their name or category has changed
        const updatedFilteredFolders = folderFromRepositoyWithoutDeletedFolders.filter(filteredFolder => {
            return updatedFolders.some(updatedFolder => {// maybe updatedFolders is enough
                const filteredProps = filteredFolder.getProps('id', 'name', 'categoryId');
                const updatedProps = updatedFolder.getProps('id', 'name', 'categoryId');

                return (
                    filteredProps.id === updatedProps.id &&
                    (filteredProps.name !== updatedProps.name || filteredProps.categoryId !== updatedProps.categoryId)
                );
            });
        });

        // get the final result of the folders that need to send to calculate tree function
        const resultFolders = [...updatedFilteredFolders, ...insertedFolders];

        this.options.logger.info(`Filtered folders for tree calculation: ${resultFolders.length} folders.`);
        return resultFolders;
    }


    private needToCalcTree(currentFoldersFromRepository: BasicFolder[], changes: BasicFolderChange): boolean {
        const currentFoldersFromRepositoryProps = currentFoldersFromRepository.map(folder => folder.getProps('name', 'categoryId'));

        const needToCalculate = (
            !isEmpty(changes.deleted) ||
            !isEmpty(changes.inserted) ||
            changes.updated.some(folder => {
                const props = folder.getProps('name', 'categoryId');
                return currentFoldersFromRepositoryProps.some(existingProps =>
                    !isEqual(props.name, existingProps.name) || !isEqual(props.categoryId, existingProps.categoryId)
                );
            })
        );

        this.options.logger.debug(`Tree calculation needed: ${needToCalculate}`);
        return needToCalculate;
    }


    private async getCurrentFoldersFromRepository(): Promise<Result<BasicFolder[]>> {
        return RetryUtils.retry(
            async () => {
                const result = await this.options.romachRepository.getBasicFolders();
                if (result.isFail()) {
                    throw new Error(`Failed to fetch current folders from repository: ${result.error()}`);
                }
                this.options.logger.info(`Fetched ${result.value().length} current folders from repository.`);
                return result;
            },
            this.options.maxRetry,
            this.options.logger
        );
    }


    private async getCurrentHierarchiesFromRepository(): Promise<Result<Hierarchy[]>> {
        return RetryUtils.retry(
            async () => {
                const result = await this.options.romachRepository.getHierarchies();
                if (result.isFail()) {
                    throw new Error(`Failed to fetch current hierarchies from repository: ${result.error()}`);
                }
                this.options.logger.info(`Fetched ${result.value().length} current hierarchies from repository.`);
                return result;
            },
            this.options.maxRetry,
            this.options.logger
        );
    }

    private async calculateTree(currentFolders: BasicFolder[], currentHierarchies: Hierarchy[]): Promise<Result<void>> {
        this.options.logger.debug("Starting tree calculation");
        try {
            await RetryUtils.retry(
                async () => {
                    this.options.treeCalculationService.calculateTree(currentFolders, currentHierarchies);
                    return Result.Ok();
                },
                this.options.maxRetry,
                this.options.logger,
            );
            this.options.logger.info("Tree calculation completed successfully.");
            return Result.Ok();
        } catch (error) {
            this.options.logger.error(`Error calculating tree: ${error.message}`);
            return Result.fail(`Tree calculation failed: ${error.message}`);
        }
    }
}

