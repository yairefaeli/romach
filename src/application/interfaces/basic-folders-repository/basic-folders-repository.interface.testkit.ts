import { aBasicFoldersList } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { BasicFoldersRepositoryInterface } from './basic-folders-repository.interface';
import { Result } from 'rich-domain';

export const BasicFoldersRepositoryTestkit = () => {
    const basicFoldersRepository: BasicFoldersRepositoryInterface = {
        saveBasicFolders: jest.fn(),
        getBasicFolderById: jest.fn(),
        deleteBasicFolderByIds: jest.fn(),
        getBasicFoldersTimestamp: jest.fn(),
        saveBasicFoldersTimestamp: jest.fn(),
        getBasicFoldersIdsAndsUpdatedAt: jest.fn(),
        getBasicFolders: jest.fn().mockReturnValue(Promise.resolve(Result.Ok([aBasicFoldersList()]))),
    };

    const mockGetBasicFoldersTimestamp = (
        value: ReturnType<BasicFoldersRepositoryInterface['getBasicFoldersTimestamp']>,
    ) => {
        basicFoldersRepository.getBasicFoldersTimestamp = jest.fn().mockReturnValue(value);
    };

    const mockGetBasicFoldersIdsAndsUpdatedAt = (
        value: ReturnType<BasicFoldersRepositoryInterface['getBasicFoldersIdsAndsUpdatedAt']>,
    ) => {
        basicFoldersRepository.getBasicFoldersIdsAndsUpdatedAt = jest.fn().mockReturnValue(value);
    };

    const mockGetBasicFolders = (value: ReturnType<BasicFoldersRepositoryInterface['getBasicFolders']>) => {
        basicFoldersRepository.getBasicFolders = jest.fn().mockReturnValue(value);
    };

    const mockGetBasicFolderById = (value: ReturnType<BasicFoldersRepositoryInterface['getBasicFolderById']>) => {
        basicFoldersRepository.getBasicFolderById = jest.fn().mockReturnValue(value);
    };

    return {
        mockGetBasicFolders,
        mockGetBasicFolderById,
        mockGetBasicFoldersTimestamp,
        mockGetBasicFoldersIdsAndsUpdatedAt,
        basicFoldersRepository: () => basicFoldersRepository,
    };
};
