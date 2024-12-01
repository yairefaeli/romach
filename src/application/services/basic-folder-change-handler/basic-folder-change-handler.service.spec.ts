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

            it('should not call update basic repository folders service', () => {});
        });

        describe('Basic Folder Updated Fail', () => {
            beforeEach(() => driver.given.basicFolderUpdated(Result.fail()).when.execute(aBasicFoldersList()));

            it('should return failed result when basicFolderUpdated fails', () => {
                expect(result.isFail()).toBe(true);
            });

            it('should log an error when basicFolderUpdated fails', () => {
                expect(driver.get.logger().error).toHaveBeenLastCalledWith(
                    expect.stringContaining('Error to calc folder changes'),
                );
            });
        });
    });

    // describe('Detect Changes', () => {
    //
    //     describe('Successful detection', () => {
    //         let result: Result<void>;
    //
    //         beforeEach(async () => {
    //             const changes = aBasicFolderChange();
    //             await driver.given.detectChanges(Result.Ok(changes)).when.init();
    //             result = await driver.when.execute([aBasicFolder()]);
    //         });
    //
    //         it('should proceed with processing changes after successful detection', () => {
    //             expect(result.isOk()).toBe(true);
    //         });
    //     });
    // });
    //
    // describe('Tree Calculation', () => {
    //     describe('Tree calculation failure', () => {
    //         let result: Result<void>;
    //
    //         beforeEach(async () => {
    //             const changes = aBasicFolderChange();
    //             await driver
    //                 .given.detectChanges(Result.Ok(changes))
    //                 .given.treeCalculationService(Result.fail('Tree calculation error'))
    //                 .when.init();
    //
    //             result = await driver.when.execute([aBasicFolder()]);
    //         });
    //
    //         it('should log an error when tree calculation fails', () => {
    //             expect(driver.get.logger().error).toHaveBeenCalledWith(
    //                 expect.stringContaining('error to tree calculator Changes: Tree calculation error'),
    //             );
    //         });
    //
    //         it('should return a failed result', () => {
    //             expect(result.isFail()).toBe(true);
    //         });
    //     });
    //
    //     describe('Successful tree calculation', () => {
    //         let result: Result<void>;
    //
    //         beforeEach(async () => {
    //             const changes = aBasicFolderChange();
    //             await driver
    //                 .given.detectChanges(Result.Ok(changes))
    //                 .given.treeCalculationService(Result.Ok())
    //                 .when.init();
    //
    //             result = await driver.when.execute([aBasicFolder()]);
    //         });
    //
    //         it('should proceed after successful tree calculation', () => {
    //             expect(result.isOk()).toBe(true);
    //         });
    //     });
    // });
    //
    // describe('Save Changes', () => {
    //     describe('Failure to save changes', () => {
    //         let result: Result<void>;
    //
    //         beforeEach(async () => {
    //             const changes = aBasicFolderChange();
    //             await driver
    //                 .given.detectChanges(Result.Ok(changes))
    //                 .given.treeCalculationService(Result.Ok())
    //                 .given.repositorySave(Result.fail('Save error'))
    //                 .when.init();
    //
    //             result = await driver.when.execute([aBasicFolder()]);
    //         });
    //
    //         it('should log an error when saving fails', () => {
    //             expect(driver.get.logger().error).toHaveBeenCalledWith(
    //                 expect.stringContaining('Failed to save changes'),
    //             );
    //         });
    //
    //         it('should return a failed result', () => {
    //             expect(result.isFail()).toBe(true);
    //         });
    //     });
    //
    //     describe('Successful save', () => {
    //         let result: Result<void>;
    //
    //         beforeEach(async () => {
    //             const changes = aBasicFolderChange();
    //             await driver
    //                 .given.detectChanges(Result.Ok(changes))
    //                 .given.treeCalculationService(Result.Ok())
    //                 .given.repositorySave(Result.Ok())
    //                 .when.init();
    //
    //             result = await driver.when.execute([aBasicFolder()]);
    //         });
    //
    //         it('should return a success result', () => {
    //             expect(result.isOk()).toBe(true);
    //         });
    //     });
    // });
});
