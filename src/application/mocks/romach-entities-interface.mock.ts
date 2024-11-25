import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';

export function romachEntitiesApiInterfaceMockBuilder(): RomachEntitiesApiInterface {
  return {
    checkPassword: jest.fn(),
    fetchBasicFoldersByTimestamp: jest.fn(),
    fetchFolderByIdAndPassword: jest.fn(),
    fetchFoldersByIdsAndPasswords: jest.fn(),
    fetchHierarchies: jest.fn(),
  }
};
