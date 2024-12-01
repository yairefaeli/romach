import { RegisteredFoldersServiceDriver } from './registered-folders.service.driver';
import { Folder } from '../../../../domain/entities/folder';
import { Result } from 'rich-domain';

describe('RegisteredFoldersService', () => {
    let driver: RegisteredFoldersServiceDriver;

    beforeEach(() => (driver = new RegisteredFoldersServiceDriver()));

    describe('upsertGeneralError', () => {
        let result: Result<Folder | void>;

        beforeEach(async () => {
            result = await driver.when.upsertGeneralError();
        });
    });
});
