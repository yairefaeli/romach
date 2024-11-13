import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';

export function romachEntitiesApiInterfaceMockBuilder(): RomachEntitiesApiInterface {
  return {
    getFolderByIdWithPassword: jest.fn(),
    getBasicFoldersByTimestamp: jest.fn(),
    getHierarchies: jest.fn(),
    getFolderByIdWithoutPassword: jest.fn(),
    checkPassword: jest.fn()
  };
};
