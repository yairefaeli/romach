import { aGeneralErrorRegisteredFolder } from '../../../../utils/builders/RegisteredFolder/registered-folder.builder';
import { RegisteredFoldersServiceDriver } from './registered-folders.service.driver';
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

            it('should return failed result when password is invalid', () => {
                expect(result.isFail()).toBe(true);
            });

            it('should return failed result when password is invalid', () => {
                expect(result.error()).toBe('general-error');
            });

            it('should log error when password is invalid', () => {
                expect(driver.get.logger().error).toHaveBeenCalledWith(
                    expect.stringContaining('Failed to create new registered folder'),
                );
            });
        });

        describe('Valid Input', () => {
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

                it('should return ok result when input is valid', () => {
                    expect(result.isFail()).toBe(true);
                });

                it('should return failed result when password is invalid', () => {
                    expect(result.error()).toBe('general-error');
                });

                it('should log error when password is invalid', () => {
                    expect(driver.get.logger().error).toHaveBeenCalledWith(
                        expect.stringContaining('Failed to upsert registered folder to repository'),
                    );
                });
            });

            describe('Upsert Registered Folder Success', () => {
                beforeEach(async () => {
                    result = await driver.given.upsertRegisteredFolderResult(Result.Ok()).when.upsertGeneralError();
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

    describe('upsertValid', () => {});
});
