import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { Result } from "rich-domain";
import { BasicFolderChange } from "../interfaces/basic-folder-changes.interface";
import { RomachRepositoryInterface } from "../interfaces/romach-repository.interface";
import { isEqual, isEmpty } from "lodash";
import { TreeCalculationService } from "src/domain/services/tree-calculation/tree-calculation.service";
import { RomachEntitiesApiInterface } from "../interfaces/romach-entities-api.interface";
import { BasicFolder } from "src/domain/entities/BasicFolder";

export interface TreeCalculationHandlerServiceOptions {
    logger: AppLoggerService,
    romachRepository: RomachRepositoryInterface,
    treeCalculationService: TreeCalculationService,
    romachEntitiesApiInterface: RomachEntitiesApiInterface

}

export class TreeCalculationHandlerService {

    constructor(private options: TreeCalculationHandlerServiceOptions) {

    }

    async execute(changes: BasicFolderChange): Promise<Result<void>> {

        const currentFoldersFromRepositoryResult = (await this.options.romachRepository.getBasicFolders()).value();
        const currentHierarchiesFromRepositoryResult = (await this.options.romachRepository.getHierarchies()).value();

        if (this.needToCalcTree) {
            const a = this.compareFolders(currentFoldersFromRepositoryResult, changes)
            this.options.treeCalculationService.calculateTree(currentFoldersFromRepositoryResult, currentHierarchiesFromRepositoryResult)
        }

        return Result.Ok();
    }


    compareFolders(currentFoldersFromRepository: BasicFolder[], changedFolders: BasicFolderChange) {
        const deletedFolders = changedFolders.deleted;
        const insertedFolders = changedFolders.inserted;
        const updatedFolders = changedFolders.updated.filter(updatedFolder => {

            const correspondingFolder = currentFoldersFromRepository.find(
                folder => folder.getProps().id === updatedFolder.getProps().id
            );

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


        currentFoldersFromRepository = [...filteredFolders, ...updatedAndInsertedFolders];

        return currentFoldersFromRepository;
    }

    needToCalcTree(currentFoldersFromRepository: BasicFolder[], changes: BasicFolderChange): boolean {
        const currentFoldersFromRepositoryResult = currentFoldersFromRepository.map(folder => folder.getProps());

        return (
            !isEmpty(changes.deleted) ||
            !isEmpty(changes.inserted) ||
            changes.updated.some(folder => {
                const props = folder.getProps();

                return currentFoldersFromRepositoryResult.some(existingProps =>
                    !isEqual(props.name, existingProps.name) || !isEqual(props.categoryId, existingProps.categoryId)
                );
            })
        );
    }
}

/*

    class then need to calc tree:
    1. when a folder is deleted
    2. when a folder is added
    3. when a folder is updated only if name or category field is changed

    //seperaete: 4. when a hierarchy is changed.

    
    get all basicFolder from database
    get all hierarchy from database


    compare (deep equal) every changed folder with the current folder in the database
    if the folder is not in the database, add it to changed folders
    if there are changed folders,
        add them to the database
        recalculate tree
    else
        do nothing
*/
