import { aBasicFolder, aBasicFoldersList } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { aIdsAndUpdatedAtList } from '../../../utils/builders/IdAndUpdatedAt/id-and-updated-at.builder';
import { BasicFoldersRepositoryInterface } from './basic-folders-repository.interface';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Result } from 'rich-domain';

export const BasicFoldersRepositoryTestkit = () => {
    const basicFoldersRepository: BasicFoldersRepositoryInterface = {
        saveBasicFolders: jest.fn().mockResolvedValue(Result.Ok()),
        deleteBasicFolderByIds: jest.fn().mockResolvedValue(Result.Ok()),
        saveBasicFoldersTimestamp: jest.fn().mockResolvedValue(Result.Ok()),
        getBasicFolderById: jest.fn().mockResolvedValue(Result.Ok(aBasicFolder())),
        getBasicFolders: jest.fn().mockResolvedValue(Result.Ok(aBasicFoldersList())),
        getBasicFoldersTimestamp: jest.fn().mockResolvedValue(Result.Ok(Timestamp.now())),
        getBasicFoldersIdsAndsUpdatedAt: jest.fn().mockResolvedValue(aIdsAndUpdatedAtList()),
    };

    const mockGetBasicFoldersTimestamp = (
        value: Awaited<ReturnType<BasicFoldersRepositoryInterface['getBasicFoldersTimestamp']>>,
    ) => {
        basicFoldersRepository.getBasicFoldersTimestamp = jest.fn().mockResolvedValue(value);
    };

    const mockGetBasicFoldersIdsAndsUpdatedAt = (
        value: Awaited<ReturnType<BasicFoldersRepositoryInterface['getBasicFoldersIdsAndsUpdatedAt']>>,
    ) => {
        basicFoldersRepository.getBasicFoldersIdsAndsUpdatedAt = jest.fn().mockResolvedValue(value);
    };

    const mockGetBasicFolders = (value: Awaited<ReturnType<BasicFoldersRepositoryInterface['getBasicFolders']>>) => {
        basicFoldersRepository.getBasicFolders = jest.fn().mockResolvedValue(value);
    };

    const mockGetBasicFolderById = (
        value: Awaited<ReturnType<BasicFoldersRepositoryInterface['getBasicFolderById']>>,
    ) => {
        basicFoldersRepository.getBasicFolderById = jest.fn().mockResolvedValue(value);
    };

    const mockSaveBasicFolders = (value: Awaited<ReturnType<BasicFoldersRepositoryInterface['saveBasicFolders']>>) => {
        basicFoldersRepository.saveBasicFolders = jest.fn().mockResolvedValue(value);
    };

    const mockDeleteBasicFolderByIds = (
        value: Awaited<ReturnType<BasicFoldersRepositoryInterface['deleteBasicFolderByIds']>>,
    ) => {
        basicFoldersRepository.deleteBasicFolderByIds = jest.fn().mockResolvedValue(value);
    };

    return {
        mockGetBasicFolders,
        mockSaveBasicFolders,
        mockGetBasicFolderById,
        mockDeleteBasicFolderByIds,
        mockGetBasicFoldersTimestamp,
        mockGetBasicFoldersIdsAndsUpdatedAt,
        basicFoldersRepository: () => basicFoldersRepository,
    };
};
