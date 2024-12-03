import { RomachEntitiesApiInterface } from './romach-entities-api.interface';
import { Result } from 'rich-domain';

export const RomachEntitiesApiTestkit = () => {
    const romachEntitiesApiInterface: RomachEntitiesApiInterface = {
        checkPassword: jest.fn(),
        fetchHierarchies: jest.fn(),
        fetchFolderByIdAndPassword: jest.fn(),
        fetchBasicFoldersByTimestamp: jest.fn(),
        fetchFoldersByIdsAndPasswords: jest.fn(),
    };

    const mockCheckPassword = (value: ReturnType<RomachEntitiesApiInterface['checkPassword']>) => {
        romachEntitiesApiInterface.checkPassword = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockFetchHierarchies = (value: ReturnType<RomachEntitiesApiInterface['fetchHierarchies']>) => {
        romachEntitiesApiInterface.fetchHierarchies = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockFetchFolderByIdAndPassword = (value: (folder) => Result<void>) => {
        romachEntitiesApiInterface.fetchFolderByIdAndPassword = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockFetchBasicFoldersByTimestamp = (
        value: ReturnType<RomachEntitiesApiInterface['fetchBasicFoldersByTimestamp']>,
    ) => {
        romachEntitiesApiInterface.fetchBasicFoldersByTimestamp = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockFetchFoldersByIdsAndPasswords = (
        value: ReturnType<RomachEntitiesApiInterface['fetchFoldersByIdsAndPasswords']>,
    ) => {
        romachEntitiesApiInterface.fetchFoldersByIdsAndPasswords = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    return {
        mockCheckPassword,
        mockFetchHierarchies,
        mockFetchFolderByIdAndPassword,
        mockFetchBasicFoldersByTimestamp,
        mockFetchFoldersByIdsAndPasswords,
        romachEntitiesApiInterface: () => romachEntitiesApiInterface,
    };
};
