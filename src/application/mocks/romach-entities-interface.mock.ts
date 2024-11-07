import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';

export function romachEntitiesApiInterfaceMockBuilder(): RomachEntitiesApiInterface {
  return {
    getFolderById: jest.fn(),
    getFolderByIdWithPassword: jest.fn(),
    getBasicFoldersByTimestamp: jest.fn(),
    getHierarchies: jest.fn(),
    checkPassword: jest.fn(),
    getFoldersByIds: jest.fn(),
  };
};
