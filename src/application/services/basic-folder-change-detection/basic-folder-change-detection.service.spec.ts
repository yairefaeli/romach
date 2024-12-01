import { BasicFolderChangeDetectionServiceDriver } from './basic-folder-change-detection.service.driver';
import { aBasicFolder } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { BasicFolderChange } from '../../interfaces/basic-folder-changes.interface';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Result } from 'rich-domain';

describe('BasicFolderChangeDetectionService', () => {
    let driver: BasicFolderChangeDetectionServiceDriver;
    let result: Result<BasicFolderChange>;

    beforeEach(() => {
        driver = new BasicFolderChangeDetectionServiceDriver();
    });

    describe('When getBasicFoldersIdsAndsUpdatedAt fails', () => {
        beforeEach(async () => {
            result = await driver.given
                .mockGetBasicFoldersIdsAndsUpdatedAt(Result.fail('Error fetching previous folders'))
                .when.execute();
        });

        it('should return a failed result', () => {
            expect(result.isFail()).toBe(true);
        });

        it('should log an error message', () => {
            expect(driver.get.logger().error).toHaveBeenCalledWith(
                expect.stringContaining('error to calc folder changes'),
            );
        });
    });

    describe('When there are changes in the folders', () => {
        beforeEach(async () => {
            const [deletedFolder, updatedFolder, insertedFolder] = [
                aBasicFolder({ deleted: true }),
                aBasicFolder({ deleted: false }),
                aBasicFolder({ deleted: false }),
            ];

            const repositoryData = [{ id: updatedFolder.getProps().id, updatedAt: Timestamp.now() }];

            // Mock repository response
            driver.given.mockGetBasicFoldersIdsAndsUpdatedAt(Result.Ok(repositoryData));

            // Execute the service
            result = await driver.when.execute([deletedFolder, updatedFolder, insertedFolder]);
        });

        it('should correctly identify inserted folders', () => {
            expect(result.isOk()).toBe(true);
            const changes = result.value();
            expect(changes.inserted).toHaveLength(1);
        });

        it('should correctly identify updated folders', () => {
            expect(result.isOk()).toBe(true);
            const changes = result.value();
            expect(changes.updated).toHaveLength(1);
        });

        it('should correctly identify deleted folders', () => {
            expect(result.isOk()).toBe(true);
            const changes = result.value();
            expect(changes.deleted).toHaveLength(1);
        });
    });
});
