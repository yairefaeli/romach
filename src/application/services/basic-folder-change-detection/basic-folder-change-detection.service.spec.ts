import { aBasicFolder, aBasicFoldersList } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { BasicFolderChangeDetectionServiceDriver } from './basic-folder-change-detection.service.driver';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Result } from 'rich-domain';

describe('BasicFolderChangeDetectionService', () => {
    let driver: BasicFolderChangeDetectionServiceDriver;

    beforeEach(() => {
        driver = new BasicFolderChangeDetectionServiceDriver();
    });

    describe('Change Detection Logic', () => {
        it('should detect deleted folders', async () => {
            const mockFolders = aBasicFoldersList(5).map((folder) =>
                aBasicFolder({ ...folder.getProps(), deleted: true }),
            );
            await driver.given.basicFoldersIdsAndUpdatedAt(Result.Ok([])).when.init();

            const response = await driver.when.execute(mockFolders);

            expect(response.isOk()).toBe(true);
            expect(response.value().deleted).toEqual(mockFolders.map((folder) => folder.getProps().id));
        });

        it('should detect updated folders', async () => {
            const previousFolders = [
                aBasicFolder({ id: 'folder1', updatedAt: Timestamp.fromDate(new Date(2022, 0, 1)) }),
                aBasicFolder({ id: 'folder2', updatedAt: Timestamp.fromDate(new Date(2022, 0, 2)) }),
            ];

            const currentFolders = [
                aBasicFolder({ id: 'folder1', updatedAt: Timestamp.fromDate(new Date(2023, 0, 1)) }), // Updated
                aBasicFolder({ id: 'folder2', updatedAt: Timestamp.fromDate(new Date(2022, 0, 2)) }), // Not updated
            ];

            await driver.given
                .basicFoldersIdsAndUpdatedAt(Result.Ok(previousFolders.map((folder) => folder.getProps())))
                .when.init();

            const response = await driver.when.execute(currentFolders);

            expect(response.isOk()).toBe(true);
            expect(response.value().updated).toEqual([currentFolders[0]]);
        });

        it('should detect inserted folders', async () => {
            const previousFolders = [aBasicFolder({ id: 'folder1' })];

            const currentFolders = [
                ...previousFolders,
                aBasicFolder({ id: 'folder2' }), // Newly inserted
            ];

            await driver.given
                .basicFoldersIdsAndUpdatedAt(Result.Ok(previousFolders.map((folder) => folder.getProps())))
                .when.init();

            const response = await driver.when.execute(currentFolders);

            expect(response.isOk()).toBe(true);
            expect(response.value().inserted).toEqual([currentFolders[1]]);
        });

        it('should handle combined changes', async () => {
            const previousFolders = [
                aBasicFolder({ id: 'folder1', updatedAt: Timestamp.fromDate(new Date(2022, 0, 1)) }),
                aBasicFolder({ id: 'folder2' }),
            ];

            const currentFolders = [
                aBasicFolder({ id: 'folder1', updatedAt: Timestamp.fromDate(new Date(2023, 0, 1)) }), // Updated
                aBasicFolder({ id: 'folder3' }), // Inserted
            ];

            await driver.given
                .basicFoldersIdsAndUpdatedAt(Result.Ok(previousFolders.map((folder) => folder.getProps())))
                .when.init();

            const response = await driver.when.execute(currentFolders);

            expect(response.isOk()).toBe(true);
            expect(response.value().updated).toEqual([currentFolders[0]]);
            expect(response.value().inserted).toEqual([currentFolders[1]]);
            expect(response.value().deleted).toEqual(['folder2']);
        });
    });
});
