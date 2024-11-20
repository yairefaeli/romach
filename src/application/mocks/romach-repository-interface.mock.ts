import { RomachRepositoryInterface } from '../interfaces/romach-repository.interface';

export function romachRepositoryInterfaceMockBuilder(): RomachRepositoryInterface {
  return {
    saveHierarchies: jest.fn(),
    getHierarchies: jest.fn(),
    getBasicFolders: jest.fn(),
    saveBasicFolders: jest.fn(),
    deleteBasicFolderByIds: jest.fn(),
    getBasicFoldersIdsAndsUpdatedAt: jest.fn(),
    getRegisteredFoldersByUpn: jest.fn(),
    upsertRegisteredFolders: jest.fn(),
    saveBasicFoldersTimestamp: jest.fn(),
    getBasicFoldersTimestamp: jest.fn(),
    getBasicFolderById: jest.fn(),
    getRegisteredFoldersById: jest.fn(),
    getRegisteredFoldersByIds: jest.fn(),
    getRegisteredFoldersByIdAndPassword: jest.fn(),
    upsertRegisteredFolder: jest.fn(),
    deleteRegisteredFoldersByIds: jest.fn(),
    deleteRegisteredFoldersByIdsForUpn: jest.fn(),
    getExpiredRegisteredFolders: jest.fn(),
    getRegisteredFoldersWithFailedStatuses: jest.fn(),
    updateRegistrationByUpnAndFolderIds: jest.fn(),
  };
}
