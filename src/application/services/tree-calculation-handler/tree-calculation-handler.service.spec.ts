import { TreeCalculationHandlerServiceDriver } from './tree-calculation-handler.service.driver';

describe('TreeCalculationHandlerService', () => {
    let driver: TreeCalculationHandlerServiceDriver;

    beforeEach(() => (driver = new TreeCalculationHandlerServiceDriver()));

    it('test this', async () => {
        await driver.given.repositoryFolders(null).when.build();
        const response = await driver.when.execute({ deleted: [], inserted: [], updated: [] });
        expect(driver.get.treeCalculationHandlerService()).toBeTruthy();
        expect(response.isFail()).toBe(true);
    });
});
