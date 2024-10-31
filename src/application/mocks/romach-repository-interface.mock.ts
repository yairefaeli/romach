import { RomachRepositoryInterface } from '../interfaces/romach-repository.interface';
import { Result } from 'rich-domain';

export function romachRepositoryInterfaceMockBuilder(): RomachRepositoryInterface {
  return {
    saveHierarchies: jest.fn(),
    getHierarchies: jest.fn(),
    saveBasicFoldersTimestamp: jest.fn(),
    getBasicFoldersTimestamp: jest.fn(),
    getBasicFolders: jest.fn(),
    saveBasicFolders: jest.fn(),
    saveBasicFoldersById: jest.fn(),
    getFoldersByIds: jest.fn(),
    deleteBasicFolderByIds: jest.fn(),
    getBasicFoldersIdsAndsUpdatedAt: jest.fn(),
    getRegisteredFoldersByUpn: jest.fn(),
    upsertRegisteredFolders: jest.fn(),
    updateFolderForAllUsers: jest.fn(),
    findUniquePasswordsForFolder: jest.fn(),
    updateFolderForUsersWithPassword: jest.fn(),
    markPasswordInvalidForUsers: jest.fn(),
  };
}
