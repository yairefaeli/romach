import { aValidRegisteredFolder } from '../../../utils/builders/RegisteredFolder/valid-registered-folder.builder';
import { RegisterFoldersForUserUseCaseDriver } from './register-folders-for-user.use-case.service.driver';
import { aBasicFolder } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { aFolder } from '../../../utils/builders/Folder/folder.builder';
import { Result } from 'rich-domain';

describe('RegisterFoldersForUserUseCase', () => {
    let driver: RegisterFoldersForUserUseCaseDriver;

    beforeEach(() => {
        driver = new RegisterFoldersForUserUseCaseDriver();
    });

    describe('Successful folder registration process', () => {
        it('should handle successful folder registration process', async () => {
            const a = aFolder({ basicFolder: aBasicFolder({ id: '1' }) });
            const b = aFolder({ basicFolder: aBasicFolder({ id: '2' }) });
            const registeredFolders = [aValidRegisteredFolder({ folder: a }), aValidRegisteredFolder({ folder: b })];

            driver.given
                .registeredFolders(Result.Ok(registeredFolders))
                .given.irrelevantFoldersDeleted(Result.Ok())
                .given.relevantFoldersUpdated(Result.Ok());

            const result = await driver.when.execute({
                folderIds: ['1', '2'],
            });

            expect(driver.get.logger().info).toHaveBeenCalledWith(
                expect.stringContaining('Starting folder registration process for user'),
            );
            expect(driver.get.logger().info).toHaveBeenCalledWith(
                expect.stringContaining('Folder registration process completed for user'),
            );
            expect(result.isOk()).toBe(true);
        });
    });

    describe('Error handling scenarios', () => {
        it('should handle failure when fetching registered folders', async () => {
            driver.given.registeredFolders(Result.fail('error-fetching-folders'));

            const result = await driver.when.execute({
                folderIds: ['1', '2'],
            });

            expect(driver.get.logger().error).toHaveBeenCalledWith(
                expect.stringContaining('Failed to fetch registered folders for user'),
            );
            expect(result.isFail()).toBe(true);
        });
    });

    describe('no irrelevant folders to delete', () => {
        it('should handle no irrelevant folders to delete', async () => {
            const a = aFolder({ basicFolder: aBasicFolder({ id: '1' }) });

            const registeredFolders = aValidRegisteredFolder({ folder: a });

            driver.given.registeredFolders(Result.Ok([registeredFolders])).given.relevantFoldersUpdated(Result.Ok());

            const result = await driver.when.execute({ folderIds: ['1'] });

            expect(driver.get.logger().debug).toHaveBeenCalledWith(
                expect.stringContaining('No irrelevant folders to delete for user'),
            );
            expect(result.isOk()).toBe(true);
        });
    });

    describe('no irrelevant folders to update', () => {
        it('should handle no relevant folders to update', async () => {
            const a = aFolder({ basicFolder: aBasicFolder({ id: '3' }) });
            const b = aFolder({ basicFolder: aBasicFolder({ id: '4' }) });
            const registeredFolders = [aValidRegisteredFolder({ folder: a }), aValidRegisteredFolder({ folder: b })];

            driver.given.registeredFolders(Result.Ok(registeredFolders)).given.irrelevantFoldersDeleted(Result.Ok());

            const result = await driver.when.execute({
                folderIds: ['1', '2'],
            });

            expect(driver.get.logger().info).toHaveBeenCalledWith(
                expect.stringContaining('Starting folder registration process for user'),
            );

            expect(result.isOk()).toBe(true);
        });
    });
});
