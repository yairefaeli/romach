import { BasicFoldersRepositoryInterface } from '../interfaces/basic-folder/basic-folder.interface';

export function repositoryInitialBasicFolderBuilder(): BasicFoldersRepositoryInterface {
    {
        return {
            saveBasicFoldersTimestamp: jest.fn(),
            getBasicFoldersTimestamp: jest.fn(),
            getBasicFolders: jest.fn(),
            getBasicFolderById: jest.fn(),
            saveBasicFolders: jest.fn(),
            deleteBasicFolderByIds: jest.fn(),
            getBasicFoldersIdsAndsUpdatedAt: jest.fn(),
        };
    }
}
