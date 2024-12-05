import { aGeneralErrorRegisteredFolder } from '../../../../utils/builders/RegisteredFolder/general-error-registered-folder.builder';
import { aValidRegisteredFolder } from '../../../../utils/builders/RegisteredFolder/valid-registered-folder.builder';
import { RegisteredFolderErrorStatus } from '../../../../domain/entities/RegisteredFolderTypes';
import { RegisteredFoldersServiceDriver } from './registered-folders.service.driver';
import { aFolder } from '../../../../utils/builders/Folder/folder.builder';
import { Folder } from '../../../../domain/entities/folder';
import { Result } from 'rich-domain';

describe('RegisteredFoldersService', () => {
    let driver: RegisteredFoldersServiceDriver;

    beforeEach(() => (driver = new RegisteredFoldersServiceDriver()));

    describe('upsertGeneralError', () => {
        let result: Result<Folder | void>;

        describe('Create General Error Folder Error', () => {
            beforeEach(async () => {
                result = await driver.given.createGeneralErrorFolderResult(Result.fail()).when.upsertGeneralError();
            });

            it('should return failed result when failed to create general folder', () => {
                expect(result.isFail()).toBe(true);
            });

            it('should return failed result when failed to create general folder', () => {
                expect(result.error()).toBe('general-error');
            });

            it('should log error when failed to create general folder', () => {
                expect(driver.get.logger().error).toHaveBeenCalledWith(
                    expect.stringContaining('Failed to create new registered folder'),
                );
            });
        });

        describe('Create General Error Folder Success', () => {
            const expectedGeneralErrorFolder = aGeneralErrorRegisteredFolder();

            beforeEach(() => driver.given.createGeneralErrorFolderResult(Result.Ok(expectedGeneralErrorFolder)));

            describe('Upsert Registered Folder Fail', () => {
                beforeEach(async () => {
                    result = await driver.given.upsertRegisteredFolderResult(Result.fail()).when.upsertGeneralError();
                });

                it('should call upsertRegisteredFolder with new folder when input is valid', () => {
                    expect(driver.get.registeredFoldersRepository().upsertRegisteredFolder).toHaveBeenCalledWith(
                        expectedGeneralErrorFolder,
                    );
                });

                it('should return failed result when upsert registered folder fails', () => {
                    expect(result.isFail()).toBe(true);
                });

                it('should return general error result when upsert registered folder fails', () => {
                    expect(result.error()).toBe('general-error');
                });

                it('should log error when when upsert registered folder fails', () => {
                    expect(driver.get.logger().error).toHaveBeenCalledWith(
                        expect.stringContaining('Failed to upsert registered folder to repository'),
                    );
                });
            });

            describe('Upsert Registered Folder Success', () => {
                beforeEach(async () => {
                    result = await driver.when.upsertGeneralError();
                });

                it('should return ok result when input is valid', () => {
                    expect(result.isOk()).toBe(true);
                });

                it('should call upsertRegisteredFolder with new folder when input is valid', () => {
                    expect(driver.get.registeredFoldersRepository().upsertRegisteredFolder).toHaveBeenCalledWith(
                        expectedGeneralErrorFolder,
                    );
                });
            });
        });
    });

    describe('upsertValid', () => {
        let result: Result<void, RegisteredFolderErrorStatus>;

        describe('Get Registered Folders Fails', () => {
            beforeEach(async () => {
                result = await driver.given.getRegisteredFoldersByIdAndPasswordResult(Result.fail()).when.upsertValid();
            });

            it('should log error when could not get registered folder', () => {
                expect(driver.get.logger().error).toHaveBeenCalledWith(
                    expect.stringContaining('Failed to get registeredFolders with'),
                );
            });

            it('should return failed result when could not get registered folder', () => {
                expect(result.isFail()).toBe(true);
            });

            it('should return general error result when could not get registered folder', () => {
                expect(result.error()).toBe('general-error');
            });
        });

        describe('Update Folders To Registered Folders Fails', () => {
            const folder = aFolder();
            const registeredFolder = aValidRegisteredFolder({ folder });

            beforeEach(async () => {
                result = await driver.given
                    .getRegisteredFoldersByIdAndPasswordResult(Result.Ok([registeredFolder]))
                    .given.createValidRegisteredFolderResult(Result.fail())
                    .when.upsertValid({ folder });
            });

            it('should return fail result when could not update registered folder', () => {
                expect(result.isFail()).toBe(true);
            });

            it('should return general error result when could not get registered folder', () => {
                expect(result.error()).toBe('general-error');
            });

            it('should log error when could not get registered folder', () => {
                expect(driver.get.logger().error).toHaveBeenCalledWith('Failed to update registeredFolders');
            });
        });
    });
});
