import { aBasicFolder, aBasicFoldersList } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { BasicFoldersRepositoryInterface } from './basic-folders-repository.interface';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Result } from 'rich-domain';

export const BasicFoldersRepositoryTestkit = () => {
    const basicFoldersRepository: BasicFoldersRepositoryInterface = {
        saveBasicFolders: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
        deleteBasicFolderByIds: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
        getBasicFolderById: jest.fn().mockReturnValue(Promise.resolve(Result.Ok(aBasicFolder()))),
        getBasicFoldersTimestamp: jest.fn().mockReturnValue(Promise.resolve(Result.Ok(Timestamp.now()))),
        saveBasicFoldersTimestamp: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
        getBasicFoldersIdsAndsUpdatedAt: jest.fn(),
        getBasicFolders: jest.fn().mockReturnValue(Promise.resolve(Result.Ok(aBasicFoldersList()))),
    };

    const mockGetBasicFoldersTimestamp = (
        value: Awaited<ReturnType<BasicFoldersRepositoryInterface['getBasicFoldersTimestamp']>>,
    ) => {
        basicFoldersRepository.getBasicFoldersTimestamp = jest.fn().mockReturnValue(value);
    };

    const mockGetBasicFoldersIdsAndsUpdatedAt = (
        value: Awaited<ReturnType<BasicFoldersRepositoryInterface['getBasicFoldersIdsAndsUpdatedAt']>>,
    ) => {
        basicFoldersRepository.getBasicFoldersIdsAndsUpdatedAt = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockGetBasicFolders = (value: Awaited<ReturnType<BasicFoldersRepositoryInterface['getBasicFolders']>>) => {
        basicFoldersRepository.getBasicFolders = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockGetBasicFolderById = (
        value: Awaited<ReturnType<BasicFoldersRepositoryInterface['getBasicFolderById']>>,
    ) => {
        basicFoldersRepository.getBasicFolderById = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockSaveBasicFolders = (value: Awaited<ReturnType<BasicFoldersRepositoryInterface['saveBasicFolders']>>) => {
        basicFoldersRepository.saveBasicFolders = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockDeleteBasicFolderByIds = (
        value: Awaited<ReturnType<BasicFoldersRepositoryInterface['deleteBasicFolderByIds']>>,
    ) => {
        basicFoldersRepository.deleteBasicFolderByIds = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    return {
        mockGetBasicFolders,
        mockGetBasicFolderById,
        mockGetBasicFoldersTimestamp,
        mockGetBasicFoldersIdsAndsUpdatedAt,
        mockDeleteBasicFolderByIds,
        mockSaveBasicFolders,
        basicFoldersRepository: () => basicFoldersRepository,
    };
};
