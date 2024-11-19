import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';

export function romachEntitiesApiInterfaceMockBuilder(): RomachEntitiesApiInterface {
  return {
    fetchBasicFoldersByTimestamp: jest.fn(),
    fetchHierarchies: jest.fn(),
    fetchFolderByIdWithoutPassword: jest.fn(),
    checkPassword: jest.fn()
  };
};
