import { BasicFolderChangeHandlerServiceDriver } from './basic-folder-change-handler.service.driver';

describe('BasicFolderChangeHandlerService', () => {
    let driver: BasicFolderChangeHandlerServiceDriver;

    beforeEach(() => {
        driver = new BasicFolderChangeHandlerServiceDriver();
    });

    // describe('Detect Changes', () => {
    //     describe('Failure to detect changes', () => {
    //         let result: Result<void>;
    //
    //         beforeEach(async () => {
    //             await driver.given.detectChanges(Result.fail('Detection error')).when.init();
    //             result = await driver.when.execute([aBasicFolder()]);
    //         });
    //
    //         it('should log an error when detection fails', () => {
    //             expect(driver.get.logger().error).toHaveBeenCalledWith(
    //                 expect.stringContaining('error to detect changes: Detection error'),
    //             );
    //         });
    //
    //         it('should return a failed result', () => {
    //             expect(result.isFail()).toBe(true);
    //         });
    //     });
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
