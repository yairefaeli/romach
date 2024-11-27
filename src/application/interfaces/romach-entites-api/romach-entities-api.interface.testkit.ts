import { RomachEntitiesApiInterface } from '../../interfaces/romach-entites-api/romach-entities-api.interface';
import { Hierarchy } from '../../../domain/entities/hierarchy';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Result } from 'rich-domain';
export const RomachEntitiesApiInterfaceTestkit = () => {
    const romachEntitiesApiInterface: jest.Mocked<RomachEntitiesApiInterface> = {
        checkPassword: jest.fn(),
        fetchFolderByIdAndPassword: jest.fn(),
        fetchHierarchies: jest.fn().mockReturnValue(Promise.resolve(Result.Ok([]))),
        fetchBasicFoldersByTimestamp: jest.fn(),
        fetchFoldersByIdsAndPasswords: jest.fn(),
    };

    const mockCheckPassword = (value: Result<boolean>) => {
        romachEntitiesApiInterface.checkPassword = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockFetchFolderByIdAndPassword = (value: Result<{ id: string; password: string }>) => {
        romachEntitiesApiInterface.fetchFolderByIdAndPassword = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockFetchHierarchies = (value: Result<Hierarchy[]>) => {
        romachEntitiesApiInterface.fetchHierarchies = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockFetchBasicFoldersByTimestamp = (value: Result<Timestamp>) => {
        romachEntitiesApiInterface.fetchBasicFoldersByTimestamp = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockFetchFoldersByIdsAndPasswords = (value: Result<{ id: string; password: string }[]>) => {
        romachEntitiesApiInterface.fetchFoldersByIdsAndPasswords = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    return {
        mockCheckPassword,
        mockFetchFolderByIdAndPassword,
        mockFetchHierarchies,
        mockFetchBasicFoldersByTimestamp,
        mockFetchFoldersByIdsAndPasswords,
        romachEntitiesApiInterface: () => romachEntitiesApiInterface,
    };
};
