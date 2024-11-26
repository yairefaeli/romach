import { TreeCalculationHandlerServiceDriver } from './tree-calculation-handler.service.driver';
import { basicFoldersMock, HierarchiesMock, TreeMock } from '../../mocks/entities.mock';
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
        // const updatedFolder = aBasicFolder();
        // const deletedFolder = aBasicFolder();
        // const updatedFolders = [aBasicFolder({ ...updatedFolder.getProps(), name: 'updated' })];
        // const existingRepositoryFolders = [updatedFolder, deletedFolder];
        //
        // beforeEach(async () => {
        //     await driver.given.repositoryFolders(Result.Ok(existingRepositoryFolders)).when.build();
        // });

        describe('Fetch hierarchies error', () => {
            let result: Result;
            const error = jest.fn();

            beforeEach(async () => {
                await driver.given.loggerError(error).given.repositoryHierarchies(Result.fail()).when.build();
                result = await driver.when.execute();
            });

            it('should log error when error', () => {
                expect(error).toHaveBeenCalledWith(
                    expect.stringContaining('Failed to fetch current hierarchies from repository'),
                );
            });

            it('should return fail when error', () => {
                expect(result.isFail()).toBe(true);
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
