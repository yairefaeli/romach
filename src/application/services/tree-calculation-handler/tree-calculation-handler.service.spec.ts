import { aBasicFolderChange } from '../../../utils/builders/BasicFolderChange/basic-folder-change.builder';
import { TreeCalculationHandlerServiceDriver } from './tree-calculation-handler.service.driver';
import { aBasicFolder } from '../../../utils/builders/BasicFolder/basic-folder.builder';
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

        it('should log error when error', () => {
            expect(driver.get.logger().error).toHaveBeenCalledWith(
                expect.stringContaining('Failed to fetch current folders from repository'),
            );
        });

        it('should return fail when error', () => {
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
            const [updatedFolder, deletedFolder, insertedFolder] = [aBasicFolder(), aBasicFolder(), aBasicFolder()];
            const changes = aBasicFolderChange({
                inserted: [insertedFolder],
                deleted: [deletedFolder.getProps().id],
                updated: [
                    aBasicFolder({ ...updatedFolder.getProps(), name: chance.name(), categoryId: chance.guid() }),
                ],
            });

            beforeEach(async () => {
                await driver.given.repositoryFolders(Result.Ok([updatedFolder, deletedFolder])).when.init();
                result = await driver.when.execute(changes);
            });

            it('should calc when deleted array is not empty', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalledWith(
                    expect.objectContaining({
                        deleted: [deletedFolder.getProps().id],
                    }),
                );
            });

            it('should calc when inserted array is not empty', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalledWith(
                    expect.objectContaining({
                        inserted: [insertedFolder],
                    }),
                );
            });

            it('should calc when updated array meets the condition (name changed)', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalledWith(
                    expect.objectContaining({
                        updated: expect.arrayContaining([
                            expect.objectContaining({ name: updatedFolder.getProps().name }),
                        ]),
                    }),
                );
            });

            it('should calc when updated array meets the condition (categoryId changed)', () => {
                expect(driver.get.treeCalculationService().calculateTree).toHaveBeenCalledWith(
                    expect.objectContaining({
                        updated: expect.arrayContaining([
                            expect.objectContaining({ categoryId: updatedFolder.getProps().categoryId }),
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
