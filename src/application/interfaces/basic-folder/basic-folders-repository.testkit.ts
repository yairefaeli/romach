import { BasicFoldersRepositoryInterface } from './basic-folder.interface';
import { override } from 'joi';

export const BasicFoldersRepositoryTestkit = () => {
    const basicFoldersRepository: BasicFoldersRepositoryInterface = {
        getBasicFolders: jest.fn(),
        saveBasicFolders: jest.fn(),
        getBasicFolderById: jest.fn(),
        deleteBasicFolderByIds: jest.fn(),
        getBasicFoldersTimestamp: jest.fn(),
        saveBasicFoldersTimestamp: jest.fn(),
        getBasicFoldersIdsAndsUpdatedAt: jest.fn(),
    };

    const mockGetBasicFolders = (value: BasicFoldersRepositoryInterface['getBasicFolders']) => {
        basicFoldersRepository.getBasicFolders = jest.fn().mockReturnValue(value);
    };

    const mockSaveBasicFolders = (value: BasicFoldersRepositoryInterface['saveBasicFolders']) => {
        basicFoldersRepository.saveBasicFolders = jest.fn().mockReturnValue(value);
    };

    const mockGetBasicFolderById = (value: BasicFoldersRepositoryInterface['getBasicFolderById']) => {
        basicFoldersRepository.getBasicFolderById = jest.fn().mockReturnValue(value);
    };

    const mockDeleteBasicFolderByIds = (value: BasicFoldersRepositoryInterface['deleteBasicFolderByIds']) => {
        basicFoldersRepository.deleteBasicFolderByIds = jest.fn().mockReturnValue(value);
    };

    const mockGetBasicFoldersTimestamp = (value: BasicFoldersRepositoryInterface['getBasicFoldersTimestamp']) => {
        basicFoldersRepository.getBasicFoldersTimestamp = jest.fn().mockReturnValue(value);
    };

    const mockSaveBasicFoldersTimestamp = (value: BasicFoldersRepositoryInterface['saveBasicFoldersTimestamp']) => {
        basicFoldersRepository.saveBasicFoldersTimestamp = jest.fn().mockReturnValue(value);
    };

    const mockGetBasicFoldersIdsAndsUpdatedAt = (
        value: BasicFoldersRepositoryInterface['getBasicFoldersIdsAndsUpdatedAt'],
    ) => {
        basicFoldersRepository.getBasicFoldersIdsAndsUpdatedAt = jest.fn().mockReturnValue(value);
    };

    return {
        mockGetBasicFolders,
        mockSaveBasicFolders,
        mockGetBasicFolderById,
        mockDeleteBasicFolderByIds,
        mockGetBasicFoldersTimestamp,
        mockSaveBasicFoldersTimestamp,
        mockGetBasicFoldersIdsAndsUpdatedAt,
        basicFoldersRepository: () => basicFoldersRepository,
    };
};
