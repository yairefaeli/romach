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

        xdescribe('With Updates', () => {
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

            it('should calc when deleted array is not empty', () => {});

            it('should calc when inserted array is not empty', () => {});

            it('should calc when deleted array is not empty', () => {});

            it('should calc when updated array meet the condition(name or categoryId changed)', () => {});
        });
    });

    //
    // describe('With Changes', () => {
    //     describe('with no updated', () => {
    //         let result: Result;
    //
    //         beforeEach(async () => {
    //             await driver.given.getHierarchies(getHierarchies).given.calculateTree(calculateTree).when.build();
    //
    //             result = await driver.when.execute(aBasicFolderChange({ updated: [], deleted: [], inserted: [] }));
    //         });
    //     });
    // });

    // it('should compute updated folders and proceed if changes exist', async () => {
    //     await driver.given.repositoryFolders(existingRepositoryFolders).when.build();
    //
    //     const response = await driver.when.execute({
    //         deleted: [],
    //         inserted: [],
    //         updated: updatedFolders,
    //     });
    //
    //     expect(driver.get.loggerInfoCalls()).toContain('Filtered folders for tree calculation: 1 folders.');
    //     expect(response.isOk()).toBe(true);
    // });
    //
    // it('should skip tree calculation if no changes are present', async () => {
    //     await driver.given.repositoryFolders([]).when.build();
    //
    //     const response = await driver.when.execute({
    //         deleted: [],
    //         inserted: [],
    //         updated: [],
    //     });
    //
    //     expect(response.isOk()).toBe(true);
    //     expect(driver.get.loggerInfoCalls()).not.toContain('Starting tree calculation');
    // });
    //
    // it('should log error and return fail if fetching hierarchies fails', async () => {
    //     await driver.given.repositoryFolders(basicFoldersMock).given.repositoryHierarchies(null).when.build();
    //
    //     const response = await driver.when.execute({
    //         deleted: [],
    //         inserted: [],
    //         updated: [],
    //     });
    //
    //     expect(driver.get.loggerErrorCalls()).toContain(
    //         'Failed to fetch current hierarchies from repository: No hierarchies found',
    //     );
    //     expect(response.isFail()).toBe(true);
    // });
    //
    // it('should call calculateTree and succeed', async () => {
    //     await driver.given
    //         .repositoryFolders(basicFoldersMock)
    //         .given.repositoryHierarchies(HierarchiesMock)
    //         .given.calculateTree(Result.Ok(TreeMock))
    //         .when.build();
    //
    //     const response = await driver.when.execute({
    //         deleted: [],
    //         inserted: [],
    //         updated: [],
    //     });
    //
    //     expect(response.isOk()).toBe(true);
    //     expect(driver.get.loggerInfoCalls()).toContain('Tree calculation completed successfully.');
    // });
    //
    // it('should log error and return fail if calculateTree fails', async () => {
    //     await driver.given
    //         .repositoryFolders(basicFoldersMock)
    //         .given.repositoryHierarchies(HierarchiesMock)
    //         .given.calculateTree(Result.fail('Tree calculation error'))
    //         .when.build();
    //
    //     const response = await driver.when.execute({
    //         deleted: [],
    //         inserted: [],
    //         updated: [],
    //     });
    //
    //     expect(response.isFail()).toBe(true);
    //     expect(driver.get.loggerErrorCalls()).toContain('Failed to calculate tree: Tree calculation error');
    // });
});
