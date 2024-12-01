import { aBasicFolderChange } from '../../../utils/builders/BasicFolderChange/basic-folder-change.builder';
import { BasicFolderChangeHandlerServiceDriver } from './basic-folder-change-handler.service.driver';
import { aBasicFoldersList } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { Result } from 'rich-domain';

describe('BasicFolderChangeHandlerService', () => {
    let result: Result;
    let driver: BasicFolderChangeHandlerServiceDriver;

    beforeEach(() => {
        driver = new BasicFolderChangeHandlerServiceDriver();
    });

    describe('Basic Folder Change Detection Fail', () => {
        beforeEach(async () => {
            result = await driver.given.detectChanges(Result.fail()).when.execute(aBasicFoldersList());
        });

        it('should return failed result when basic folder change detection fails', () => {
            expect(result.isFail()).toBe(true);
        });

        it('should log an error when basic folder change detection fails', () => {
            expect(driver.get.logger().error).toHaveBeenLastCalledWith(
                expect.stringContaining('Error to detect changes'),
            );
        });
    });

    describe('Basic Folder Change Detection Success', () => {
        beforeEach(() => driver.given.detectChanges(Result.Ok(aBasicFolderChange())));

        describe('Tree Calculation Fail', () => {
            beforeEach(async () => {
                result = await driver.given.executeTreeCalculation(Result.fail()).when.execute(aBasicFoldersList());
            });

            it('should return failed result when tree calculation fails', () => {
                expect(result.isFail()).toBe(true);
            });

            it('should log an error when tree calculation fails', () => {
                expect(driver.get.logger().error).toHaveBeenLastCalledWith(
                    expect.stringContaining('Error to tree calculator changes'),
                );
            });

            it('should not call update basic repository folders service', () => {
                expect(driver.get.updateBasicFoldersRepositoryService().execute).not.toHaveBeenCalled();
            });
        });

        describe('Basic Folder Updated Fail', () => {
            beforeEach(() =>
                driver.given.mockHandleBasicFoldersChange(Result.fail()).when.execute(aBasicFoldersList()),
            );

            it('should return failed result when basicFolderUpdated fails', () => {
                expect(result.isFail()).toBe(true);
            });

            it('should log an error when basicFolderUpdated fails', () => {
                expect(driver.get.logger().error).toHaveBeenLastCalledWith(
                    expect.stringContaining('Error to calc folder changes'),
                );
            });

            it('should not call update basic repository folders service', () => {
                expect(driver.get.updateBasicFoldersRepositoryService().execute).not.toHaveBeenCalled();
            });
        });

        describe('Update Basic Folders Repository', () => {
            const changes = aBasicFolderChange();

            beforeEach(() => driver.given.detectChanges(Result.Ok(changes)));

            describe('Update Basic Folders Repository Fail', () => {
                beforeEach(async () => {
                    result = await driver.given
                        .updateBasicFoldersRepository(Result.fail())
                        .when.execute(aBasicFoldersList());
                });

                it('should call update basic repository folders service with detected changes', () => {
                    expect(driver.get.updateBasicFoldersRepositoryService().execute).toHaveBeenCalledWith(changes);
                });

                it('should return fail result when update basic folders repository fails', () => {
                    expect(result.isFail()).toBe(true);
                });
            });

            describe('Update Basic Folders Repository Success', () => {
                beforeEach(async () => {
                    result = await driver.when.execute(aBasicFoldersList());
                });

                it('should call update basic repository folders service with folders list', () => {
                    expect(driver.get.updateBasicFoldersRepositoryService().execute).toHaveBeenCalledWith(changes);
                });

                it('should return fail result when update basic folders repository fails', () => {
                    expect(result.isOk()).toBe(true);
                });
            });
        });
    });
});
