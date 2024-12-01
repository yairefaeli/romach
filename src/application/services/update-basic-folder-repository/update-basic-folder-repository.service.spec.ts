import { UpdateBasicFoldersRepositoryServiceDriver } from './update-basic-folder-repository.service.driver';
import { aBasicFolderChange } from '../../../utils/builders/BasicFolderChange/basic-folder-change.builder';
import { Result } from 'rich-domain';

describe('UpdateBasicFoldersRepositoryService', () => {
    let driver: UpdateBasicFoldersRepositoryServiceDriver;
    let result: Result;

    beforeEach(() => {
        driver = new UpdateBasicFoldersRepositoryServiceDriver();
    });

    describe('When saving folders fails', () => {
        beforeEach(async () => {
            driver.given
                .mockSaveBasicFolders(Result.fail('Error saving folders'))
                .given.mockDeleteBasicFolderByIds(Result.Ok());
            const changes = aBasicFolderChange();
            result = await driver.when.execute(changes);
        });

        it('should log an error message', () => {
            expect(driver.get.logger().error).toHaveBeenCalledWith(
                expect.stringContaining('Error saving basic folders'),
            );
        });

        it('should return a failed result', () => {
            expect(result.isFail()).toBe(true);
        });
    });

    describe('When deleting folders fails', () => {
        beforeEach(async () => {
            const changes = aBasicFolderChange();
            result = await driver.given
                .mockSaveBasicFolders(Result.Ok())
                .given.mockDeleteBasicFolderByIds(Result.fail('Error deleting folders'))
                .when.execute(changes);
        });

        it('should log an error message', () => {
            expect(driver.get.logger().error).toHaveBeenCalledWith(
                expect.stringContaining('Error deleting basic folders'),
            );
        });

        it('should return a failed result', () => {
            expect(result.isFail()).toBe(true);
        });
    });

    describe('When all operations succeed', () => {
        beforeEach(async () => {
            const changes = aBasicFolderChange();
            result = await driver.given
                .mockSaveBasicFolders(Result.Ok())
                .given.mockDeleteBasicFolderByIds(Result.Ok())
                .when.execute(changes);
        });

        it('should log the successful saving of folders', () => {
            expect(driver.get.logger().info).toHaveBeenCalledWith(expect.stringContaining('Successfully saved'));
        });

        it('should log the successful deletion of folders', () => {
            expect(driver.get.logger().info).toHaveBeenCalledWith(expect.stringContaining('Successfully deleted'));
        });

        it('should return a successful result', () => {
            expect(result.isOk()).toBe(true);
        });
    });
});
