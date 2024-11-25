import { BasicFolder } from "../../../domain/entities/BasicFolder";
import { TreeCalculationHandlerServiceDriver } from "./tree-calculation-handler.service.driver";
import { Timestamp } from "../../../domain/entities/Timestamp";
import { Result } from "rich-domain";
import { basicFoldersMock, HierarchiesMock, TreeMock } from "../../../application/mocks/entities.mock"

describe('TreeCalculationHandlerService', () => {
    let driver: TreeCalculationHandlerServiceDriver;

    beforeEach(() => {
        driver = new TreeCalculationHandlerServiceDriver();
    });

    it('should log error and return fail if fetching current folders fails', async () => {
        await driver
            .given.repositoryFolders(null)
            .when.build();

        const response = await driver.when.execute({ deleted: [], inserted: [], updated: [] });

        expect(driver.get.loggerErrorCalls()).toContain(
            'Failed to fetch current folders from repository: No folders found',
        );
        expect(response.isFail()).toBe(true);
    });


    it('should compute updated folders and proceed if changes exist', async () => {
        const mockFolders = [
            BasicFolder.create({
                id: 'folder1', name: 'Folder 1', categoryId: 'cat1',
                deleted: false,
                isLocal: false,
                isPasswordProtected: false,
                creationDate: '',
                updatedAt: Timestamp.now()
            }),
        ];

        const updatedFolders = [
            BasicFolder.create({
                id: 'folder1', name: 'Updated Folder 1', categoryId: 'cat1',
                deleted: false,
                isLocal: false,
                isPasswordProtected: false,
                creationDate: '',
                updatedAt: Timestamp.now()
            }),
        ];

        await driver.given.repositoryFolders(mockFolders.map(folder => folder.value())).when.build();

        const response = await driver.when.execute({
            deleted: [],
            inserted: [],
            updated: updatedFolders.map(folder => folder.value()),
        }); 

        expect(driver.get.loggerInfoCalls()).toContain(
            'Filtered folders for tree calculation: 1 folders.',
        );
        expect(response.isOk()).toBe(true);
    });

    it('should skip tree calculation if no changes are present', async () => {
        await driver.given.repositoryFolders([]).when.build();

        const response = await driver.when.execute({
            deleted: [],
            inserted: [],
            updated: [],
        });

        expect(response.isOk()).toBe(true);
        expect(driver.get.loggerInfoCalls()).not.toContain(
            'Starting tree calculation',
        );
    });

    it('should log error and return fail if fetching hierarchies fails', async () => {
        await driver
            .given.repositoryFolders(basicFoldersMock)
            .given.repositoryHierarchies(null)
            .when.build();

        const response = await driver.when.execute({
            deleted: [],
            inserted: [],
            updated: [],
        });

        expect(driver.get.loggerErrorCalls()).toContain(
            'Failed to fetch current hierarchies from repository: No hierarchies found',
        );
        expect(response.isFail()).toBe(true);
    });

    it('should call calculateTree and succeed', async () => {
        await driver
            .given.repositoryFolders(basicFoldersMock)
            .given.repositoryHierarchies(HierarchiesMock)
            .given.calculateTree(Result.Ok(TreeMock))
            .when.build();

        const response = await driver.when.execute({
            deleted: [],
            inserted: [],
            updated: [],
        });

        expect(response.isOk()).toBe(true);
        expect(driver.get.loggerInfoCalls()).toContain('Tree calculation completed successfully.');
    });


    it('should log error and return fail if calculateTree fails', async () => {
        await driver
            .given.repositoryFolders(basicFoldersMock)
            .given.repositoryHierarchies(HierarchiesMock)
            .given.calculateTree(Result.fail('Tree calculation error'))
            .when.build();

        const response = await driver.when.execute({
            deleted: [],
            inserted: [],
            updated: [],
        });

        expect(response.isFail()).toBe(true);
        expect(driver.get.loggerErrorCalls()).toContain(
            'Failed to calculate tree: Tree calculation error',
        );
    });
});
