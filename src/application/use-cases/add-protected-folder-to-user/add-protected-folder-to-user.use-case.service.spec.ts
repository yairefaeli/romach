import { AddProtectedFolderToUserUseCaseDriver } from './add-protected-folder-to-user.use-case.service.driver';
import { aBasicFolder } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { aFolder } from '../../../utils/builders/Folder/folder.builder';
import { Result } from 'rich-domain';

describe('AddProtectedFolderToUserUseCase', () => {
    let driver: AddProtectedFolderToUserUseCaseDriver;

    beforeEach(() => {
        driver = new AddProtectedFolderToUserUseCaseDriver();
    });

    it('should handle valid input and upsert folder', async () => {
        const basicFolder = aBasicFolder({ isPasswordProtected: false });
        const folder = aFolder();

        driver.given.basicFolderFetched(Result.Ok(basicFolder)).given.folderFetched(Promise.resolve(Result.Ok(folder)));
        const result = await driver.when.execute({
            upn: 'test-user',
            password: '',
            folderId: basicFolder.getProps().id,
        });

        expect(result.isOk()).toBe(true);
    });

    it('should handle folder ID not found', async () => {
        driver.given.basicFolderFetched(Result.fail());

        const result = await driver.when.execute({
            upn: 'test-user',
            password: 'test-password',
            folderId: 'invalid-folder-id',
        });

        expect(result.isFail()).toBe(false);
    });

    it('should handle incorrect password for protected folder', async () => {
        const basicFolder = aBasicFolder({ isPasswordProtected: true });
        driver.given.basicFolderFetched(Result.Ok(basicFolder)).given.passwordCheck(Promise.resolve(Result.Ok(false)));

        const result = await driver.when.execute({
            upn: 'test-user',
            password: 'wrong-password',
            folderId: basicFolder.getProps().id,
        });

        expect(result.isFail()).toBe(true);
    });

    it('should handle failure when fetching folder by ID and password', async () => {
        const basicFolder = aBasicFolder({ isPasswordProtected: true });
        driver.given.basicFolderFetched(Result.Ok(basicFolder));

        const result = await driver.when.execute({
            upn: 'test-user',
            password: 'test-password',
            folderId: basicFolder.getProps().id,
        });

        expect(result.isFail()).toBe(true);
    });
});
