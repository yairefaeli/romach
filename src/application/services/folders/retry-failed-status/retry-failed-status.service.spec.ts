import { aValidRegisteredFoldersList } from '../../../../utils/builders/RegisteredFolder/valid-registered-folder.builder';
import { RetryFailedStatusServiceDriver } from './retry-failed-status.service.driver';
import { Result } from 'rich-domain';

describe('RetryFailedStatusService', () => {
    let driver: RetryFailedStatusServiceDriver;
    let result: Result<void>;

    beforeEach(async () => {
        driver = new RetryFailedStatusServiceDriver();
    });

    describe('When fetching failed folders fails', () => {
        beforeEach(async () => {
            driver.given.mockFetchFailedFolders(Result.fail());
            result = await driver.when.execute();
        });

        it('should log an error message', () => {
            expect(driver.get.logger().error).toHaveBeenCalledWith(
                expect.stringMatching('Failed to fetch failed registered folders.'),
            );
        });

        it('should return a failed result', () => {
            console.log('Result:', result);
            expect(result.isFail()).toBe(true);
        });
    });

    describe('When no failed folders are found', () => {
        beforeEach(async () => {
            driver.given.mockFetchFailedFolders(Result.Ok([]));
            result = await driver.when.execute();
        });

        it('should log an info message about no folders', () => {
            expect(driver.get.logger().info).toHaveBeenCalledWith(
                expect.stringContaining('No failed registered folders found for retry.'),
            );
        });

        it('should return a successful result', () => {
            console.log('Result:', result);
            expect(result.isOk()).toBe(true);
        });
    });

    describe('When retrying folders succeeds', () => {
        beforeEach(async () => {
            const failedFolders = aValidRegisteredFoldersList(3);

            driver.given
                .mockFetchFailedFolders(Result.Ok(failedFolders))
                .given.mockRetryFetchFolderByIdAndPassword(Result.Ok(failedFolders))
                .given.mockUpsertRegisteredFolders(Result.Ok());

            result = await driver.when.execute();
        });

        it('should log the successful retry of folders', () => {
            expect(driver.get.logger().info).toHaveBeenCalledWith(
                expect.stringContaining('Successfully retried 3 folders.'),
            );
        });

        it('should return a successful result', () => {
            expect(result.isOk()).toBe(true);
        });
    });
});
