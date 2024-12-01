import { aValidRegisteredFoldersList } from '../../../../utils/builders/RegisteredFolder/registered-folder.builder';
import { GarbageCollectorServiceDriver } from './garbage-collector.service.driver';
import { Result } from 'rich-domain';

describe('GarbageCollectorService', () => {
    let driver: GarbageCollectorServiceDriver;

    beforeEach(() => (driver = new GarbageCollectorServiceDriver()));

    describe('Fetch Expired Folders Failed', () => {
        beforeEach(() => driver.given.getExpiredRegisteredFolders(Result.fail()).when.execute());

        it('should log error when fetchExpiredFolders fails', () => {
            expect(driver.get.logger().error).toHaveBeenCalledWith('Failed to fetch expired registered folders');
        });

        it('should not call delete expired folders when fetchExpiredFolders fails', () => {
            expect(driver.get.registeredFoldersRepository().deleteRegisteredFoldersByIds).not.toHaveBeenCalled();
        });

        it('should call setTimeout with next garbage collection', () => {
            expect(setTimeout).toHaveBeenCalledWith(driver.get.garbageCollectionFunction(), driver.get.gcInterval());
        });
    });

    describe('Fetch Expired Folders Success', () => {
        describe('Empty Expired Folders', () => {
            beforeEach(() => driver.given.getExpiredRegisteredFolders(Result.Ok([])).when.execute());

            it('should log info when there are no expired folders', () => {
                expect(driver.get.logger().info).toHaveBeenCalledWith('No registered folders found for deletion');
            });

            it('should call setTimeout with next garbage collection', () => {
                expect(setTimeout).toHaveBeenCalledWith(
                    driver.get.garbageCollectionFunction(),
                    driver.get.gcInterval(),
                );
            });
        });

        describe('With Expired Folders', () => {
            describe('Delete Folders Failed', () => {
                beforeEach(() => driver.given.deleteRegisteredFoldersByIds(Result.fail()).when.execute());

                it('should log error when deleting registered folders fails', () => {
                    expect(driver.get.logger().error).toHaveBeenCalledWith(
                        expect.stringContaining('Failed to delete expired registered folders'),
                    );
                });

                it('should call setTimeout with next garbage collection', () => {
                    expect(setTimeout).toHaveBeenCalledWith(
                        driver.get.garbageCollectionFunction(),
                        driver.get.gcInterval(),
                    );
                });
            });

            describe('Delete Folders Success', () => {
                const expiredFolders = aValidRegisteredFoldersList();
                const expiredFoldersIds = expiredFolders.map((expiredFolder) => expiredFolder.getProps().folderId);

                beforeEach(() => driver.given.getExpiredRegisteredFolders(Result.Ok(expiredFolders)).when.execute());

                it('should call delete registered folders with expired folders', () => {
                    expect(driver.get.registeredFoldersRepository().deleteRegisteredFoldersByIds).toHaveBeenCalledWith(
                        expiredFoldersIds,
                    );
                });

                it('should log info when deleting registered folders succeeds', () => {
                    expect(driver.get.logger().info).toHaveBeenCalledWith(
                        `Deleted ${expiredFolders.length} expired registered folders`,
                    );
                });

                it('should call setTimeout with next garbage collection', () => {
                    expect(setTimeout).toHaveBeenCalledWith(
                        driver.get.garbageCollectionFunction(),
                        driver.get.gcInterval(),
                    );
                });
            });
        });
    });
});
