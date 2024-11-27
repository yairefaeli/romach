import { aBasicFolderChange } from '../../../utils/builders/BasicFolderChange/basic-folder-change.builder';
import { TreeCalculationHandlerServiceDriver } from './tree-calculation-handler.service.driver';
import { aBasicFolder } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { aHierarchy } from '../../../utils/builders/Hierarchy/hierarchy.builder';
import { chance } from '../../../utils/Chance/chance';
import { Result } from 'rich-domain';

describe('TreeCalculationHandlerService', () => {
    let driver: TreeCalculationHandlerServiceDriver;

    beforeEach(() => {
        driver = new TreeCalculationHandlerServiceDriver();
    });

    describe('Fetching current folders failed', () => {
        let result: Result;

        beforeEach(async () => {
            await driver.given.repositoryFolders(Result.fail()).when.init();
            result = await driver.when.execute();
        });

        it('should log error when error occurs', () => {
            expect(driver.get.logger().error).toHaveBeenCalledWith(
                expect.stringContaining('Failed to fetch current folders from repository'),
            );
        });

        it('should return fail when error occurs', () => {
            expect(result.isFail()).toBe(true);
        });
    });

    describe('Calc Tree', () => {
        describe('No Changes', () => {
            let result: Result;

            beforeEach(async () => {
                await driver.when.init();
                result = await driver.when.execute(aBasicFolderChange({ updated: [], deleted: [], inserted: [] }));
            });

            it('should return an empty OK response', () => {
                expect(result.isOk()).toBe(true);
            });

            it('should not fetch hierarchies', () => {
                expect(driver.get.hierarchiesRepository().getHierarchies).not.toHaveBeenCalled();
            });

            it('should not call the calc tree function', () => {
                expect(driver.get.treeCalculationService().calculateTree).not.toHaveBeenCalled();
            });
        });

        describe('No Relevant Updates', () => {
            let result: Result;
            const repositoryBasicFolder = aBasicFolder();
            const changedBasicFolder = aBasicFolder({
                ...repositoryBasicFolder.getProps(),
                isPasswordProtected: !repositoryBasicFolder,
            });

            beforeEach(async () => {
                await driver.given.repositoryFolders(Result.Ok([repositoryBasicFolder])).when.init();
                result = await driver.when.execute(
                    aBasicFolderChange({ updated: [changedBasicFolder], deleted: [], inserted: [] }),
                );
            });

            it('should return an empty OK response', () => {
                expect(result.isOk()).toBe(true);
            });

            it('should not call the calc tree function', () => {
                expect(driver.get.treeCalculationService().calculateTree).not.toHaveBeenCalled();
            });
        });

        describe('With Updates', () => {
            let result: Result;
            const [updatedFolder, deletedFolder, insertedFolder] = [aBasicFolder(), aBasicFolder(), aBasicFolder()];
            const changes = aBasicFolderChange({
                inserted: [insertedFolder],
                deleted: [deletedFolder.getProps().id],
                updated: [
                    aBasicFolder({ ...updatedFolder.getProps(), name: chance.name(), categoryId: chance.guid() }),
                ],
            });

            beforeEach(async () => {
                await driver.given
                    .repositoryFolders(Result.Ok([updatedFolder, deletedFolder]))
                    .given.repositoryHierarchies(Result.Ok([aHierarchy()]))
                    .when.init();
                result = await driver.when.execute(changes);
            });

            it('should calc when the deleted array is not empty', () => {
                // Access the first call to the mocked calculateTree method
                const [mergedFolders] = driver.get.treeCalculationService().calculateTree.mock.calls[0];

                // Validate the mergedFolders do not include the deleted folder
                expect(mergedFolders).not.toEqual(
                    expect.arrayContaining([expect.objectContaining({ id: deletedFolder.getProps().id })]),
                );

                // Verify calculateTree was called
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalled();
            });

            it('should calc when the inserted array is not empty', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalledWith(
                    expect.arrayContaining([insertedFolder]),
                );
            });

            it('should calc when updated array meets the condition (name changed)', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalledWith(
                    expect.arrayContaining([expect.objectContaining({ name: updatedFolder.getProps().name })]),
                );
            });

            it('should calc when updated array meets the condition (categoryId changed)', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({ categoryId: updatedFolder.getProps().categoryId }),
                    ]),
                );
            });

            it('should return a success result after calculation', () => {
                expect(result.isOk()).toBe(true);
            });
        });
    });
});
