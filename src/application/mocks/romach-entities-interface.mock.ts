import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';

export function romachEntitiesApiInterfaceMockBuilder(): RomachEntitiesApiInterface {
  return {
    fetchFolderByIdWithPassword: jest.fn(),
    fetchBasicFoldersByTimestamp: jest.fn(),
    fetchHierarchies: jest.fn(),
    fetchFolderByIdWithoutPassword: jest.fn(),
    checkPassword: jest.fn()
  };
};
