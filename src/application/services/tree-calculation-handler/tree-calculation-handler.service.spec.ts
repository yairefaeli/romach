import { aBasicFolderChange } from '../../../utils/builders/BasicFolderChange/basic-folder-change.builder';
import { TreeCalculationHandlerServiceDriver } from './tree-calculation-handler.service.driver';
import { Result } from 'rich-domain';

describe('TreeCalculationHandlerService', () => {
    let driver: TreeCalculationHandlerServiceDriver;

    beforeEach(() => {
        driver = new TreeCalculationHandlerServiceDriver();
    });

    describe('Fetching current folders failed', () => {
        let result: Result;
        const error = jest.fn();

        beforeEach(async () => {
            await driver.given.repositoryFolders(Result.fail()).given.loggerError(error).when.build();
            result = await driver.when.execute();
        });

        it('should log error when error', () => {
            expect(error).toHaveBeenCalledWith(
                expect.stringContaining('Failed to fetch current folders from repository'),
            );
        });

        it('should return fail when error', () => {
            expect(result.isFail()).toBe(true);
        });
    });

    describe('Calc Tree', () => {
        describe('No changes', () => {
            let result: Result;
            const getHierarchies = jest.fn();
            const calculateTree = jest.fn();

            beforeEach(async () => {
                await driver.given.getHierarchies(getHierarchies).given.calculateTree(calculateTree).when.build();

                result = await driver.when.execute(aBasicFolderChange({ updated: [], deleted: [], inserted: [] }));
                describe('No Changes', () => {
                    it('should not fetch hierarchies', () => {
                        expect(getHierarchies).not.toHaveBeenCalled();
                    });

                    it('should return empty ok response', () => {
                        expect(result.isOk()).toBe(true);
                    });

                    it('should not call to calc tree function', () => {
                        expect(calculateTree).not.toHaveBeenCalled();
                    });
                });
            });

            describe('No Updates', () => {
                let result: Result;
                await driver.given.getHierarchies(getHierarchies).given.calculateTree(calculateTree).when.build();
                result = await driver.when.execute(aBasicFolderChange({ updated: [], deleted: [], inserted: [] }));
            });
            describe('With Updates', () => {});
        });

        describe('With Changes', () => {
            describe('with no updated', () => {
                let result: Result;

                beforeEach(async () => {
                    await driver.given.getHierarchies(getHierarchies).given.calculateTree(calculateTree).when.build();

                    result = await driver.when.execute(aBasicFolderChange({ updated: [], deleted: [], inserted: [] }));
                });
            });
        });
    });
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
