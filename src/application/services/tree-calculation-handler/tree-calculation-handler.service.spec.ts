import { aBasicFolderChange } from '../../../utils/builders/BasicFolderChange/basic-folder-change.builder';
import { aBasicFolder, aBasicFoldersList } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { TreeCalculationHandlerServiceDriver } from './tree-calculation-handler.service.driver';
import { aHierarchy } from '../../../utils/builders/Hierarchy/hierarchy.builder';
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

        it('should log error when error', () => {
            expect(driver.get.logger().error).toHaveBeenCalledWith(
                expect.stringContaining('Failed to fetch current folders from repository'),
            );
        });

        it('should return fail when error', () => {
            expect(result.isFail()).toBe(true);
        });
    });

    describe('Calculate Tree', () => {
        describe('No Changes', () => {
            let result: Result;

            beforeEach(async () => {
                await driver.when.init();

                result = await driver.when.execute(aBasicFolderChange({ updated: [], deleted: [], inserted: [] }));
            });

            it('should return empty ok response', () => {
                expect(result.isOk()).toBe(true);
            });

            it('should not fetch hierarchies', () => {
                expect(driver.get.hierarchiesRepository().getHierarchies).not.toHaveBeenCalled();
            });

            it('should not call to calc tree function', () => {
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

            it('should return empty ok response', () => {
                expect(result.isOk()).toBe(true);
            });

            it('should not call to calc tree function', () => {
                expect(driver.get.treeCalculationService().calculateTree).not.toHaveBeenCalled();
            });
        });

        describe('With Updates', () => {
            let result: Result;
            const [updatedCategoryFolder, updatedNameFolder, deletedFolder, insertedFolder] = aBasicFoldersList(4);
            const repositoryFolders = [];
            const changes = aBasicFolderChange({
                inserted: [insertedFolder],
                deleted: [deletedFolder.getProps().id],
                updated: [updatedCategoryFolder, updatedNameFolder],
            });

            beforeEach(async () => {
                await driver.given
                    .repositoryFolders(Result.Ok([updatedCategoryFolder, updatedNameFolder, deletedFolder]))
                    .given.repositoryHierarchies(Result.Ok([aHierarchy()]))
                    .when.init();
                result = await driver.when.execute(changes);
            });

            it('should call calculateTree without deleted folders when deleted array is not empty', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalled();
            });

            it('should calculateTree with inserted folders when inserted array is not empty', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalledWith(
                    expect.objectContaining({
                        inserted: [insertedFolder],
                    }),
                );
            });

            it('should calculateTree with updated folders when updated array meets the condition (name changed)', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalledWith(
                    expect.objectContaining({
                        updated: expect.arrayContaining([
                            expect.objectContaining({ name: updatedNameFolder.getProps().name }),
                        ]),
                    }),
                );
            });

            it('should calc when updated array meets the condition (categoryId changed)', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalledWith(
                    expect.objectContaining({
                        updated: expect.arrayContaining([
                            expect.objectContaining({ categoryId: updatedNameFolder.getProps().categoryId }),
                        ]),
                    }),
                );
            });

            it('should return success result after calculation', () => {
                expect(result.isOk()).toBe(true);
            });
        });
    });
});
