import { RegisteredFolderRepositoryInterface } from '../interfaces/registered-folders-repository/registered-folder-repository.interface';

export function repositoryInitialHierarchiesBuilder(): RegisteredFolderRepositoryInterface {
    return {
        getRegisteredFoldersById: jest.fn(),
        getRegisteredFoldersByIds: jest.fn(),
        getRegisteredFoldersByIdAndPassword: jest.fn(),
        getRegisteredFoldersByUpn: jest.fn(),
        upsertRegisteredFolder: jest.fn(),
        upsertRegisteredFolders: jest.fn(),
        deleteRegisteredFoldersByIds: jest.fn(),
        deleteRegisteredFoldersByIdsForUpn: jest.fn(),
        updateRegistrationByUpnAndFolderIds: jest.fn(),
        getExpiredRegisteredFolders: jest.fn(),
        getRegisteredFoldersWithFailedStatuses: jest.fn(),
    };
}
