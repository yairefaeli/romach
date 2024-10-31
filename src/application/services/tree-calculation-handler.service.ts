import { Result } from 'rich-domain';
import { isEmpty, isEqual } from 'lodash';
import { TreeCalculationService } from 'src/domain/services/tree-calculation/tree-calculation.service';
import { BasicFolderChange } from '../interfaces/basic-folder-changes.interface';
import { RomachRepositoryInterface } from '../interfaces/romach-repository.interface';
import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';
import { RetryUtils } from 'src/utils/RetryUtils/RetryUtils';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Hierarchy } from 'src/domain/entities/Hierarchy';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';

export interface TreeCalculationHandlerServiceOptions {
    logger: AppLoggerService,
    romachRepository: RomachRepositoryInterface,
    treeCalculationService: TreeCalculationService,
    romachEntitiesApiInterface: RomachEntitiesApiInterface,
    maxRetry: number
}

export class TreeCalculationHandlerService {
    constructor(private options: TreeCalculationHandlerServiceOptions) { }

    async execute(changes: BasicFolderChange): Promise<Result<void>> {
        const currentFoldersFromRepositoryResult = await this.getCurrentFoldersFromRepository();
        const currentHierarchiesFromRepositoryResult = await this.getCurrentHierarchiesFromRepository();

        if (this.needToCalcTree(currentFoldersFromRepositoryResult, changes)) {
            const updatedFolders = this.compareFolders(currentFoldersFromRepositoryResult, changes);
            await this.calculateTree(updatedFolders, currentHierarchiesFromRepositoryResult);
        }

        return Result.Ok();
    }

    private compareFolders(currentFoldersFromRepository: BasicFolder[], changedFolders: BasicFolderChange): BasicFolder[] {
        const deletedFolders = changedFolders.deleted;
        const insertedFolders = changedFolders.inserted;
        const updatedFolders = changedFolders.updated.filter(updatedFolder => {
            const correspondingFolder = currentFoldersFromRepository.find(
                folder => folder.getProps().id === updatedFolder.getProps().id
            );

            if (!correspondingFolder) {
                return true;
            }

            const updatedProps = updatedFolder.getProps();
            const currentProps = correspondingFolder.getProps();

            return (
                updatedProps.name !== currentProps.name ||
                updatedProps.categoryId !== currentProps.categoryId
            );
        });

        const updatedAndInsertedFolders = [
            ...insertedFolders,
            ...updatedFolders
        ];

        const filteredFolders = currentFoldersFromRepository.filter(folder =>
            !deletedFolders.includes(folder.getProps().id)
        );

        const resultFolders = [...filteredFolders, ...updatedAndInsertedFolders];
        this.options.logger.info(`Filtered folders for tree calculation: ${resultFolders.length} folders.`);
        return resultFolders;
    }

    private needToCalcTree(currentFoldersFromRepository: BasicFolder[], changes: BasicFolderChange): boolean {
        const currentFoldersFromRepositoryResult = currentFoldersFromRepository.map(folder => folder.getProps());

        const needToCalculate = (
            !isEmpty(changes.deleted) ||
            !isEmpty(changes.inserted) ||
            changes.updated.some(folder => {
                const props = folder.getProps();
                return currentFoldersFromRepositoryResult.some(existingProps =>
                    !isEqual(props.name, existingProps.name) || !isEqual(props.categoryId, existingProps.categoryId)
                );
            })
        );

        this.options.logger.debug(`Tree calculation needed: ${needToCalculate}`);
        return needToCalculate;
    }


    private async getCurrentFoldersFromRepository() {
        const result = await RetryUtils.retry(() => this.options.romachRepository.getBasicFolders(), this.options.maxRetry, this.options.logger);
        if (result.isFail()) {
            throw new Error(`Failed to fetch current folders from repository: ${result.error()}`);
        }
        this.options.logger.info(`Fetched ${result.value().length} current folders from repository.`);

        return result.value();
    }


    private async getCurrentHierarchiesFromRepository() {
        const result = await RetryUtils.retry(() => this.options.romachRepository.getHierarchies(), this.options.maxRetry, this.options.logger);

        if (result.isFail()) {
            throw new Error(`Failed to fetch current hierarchies from repository: ${result.error()}`);
        }
        this.options.logger.info(`Fetched ${result.value().length} current hierarchies from repository.`);
        return result.value();
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

