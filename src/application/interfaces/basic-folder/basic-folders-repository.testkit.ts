import { BasicFoldersRepositoryInterface, NullableTimestamp } from './basic-folder.interface';
import { aBasicFolder } from '../../../utils/builders/BasicFolder/basic-folder.builder';
import { FoldersIdsAndsUpdatedAt } from '../../view-model/folders-by-ids-response';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Result } from 'rich-domain';

export const BasicFoldersRepositoryTestkit = () => {
    const basicFoldersRepository: jest.Mocked<BasicFoldersRepositoryInterface> = {
        getBasicFolders: jest.fn().mockReturnValue(Promise.resolve(Result.Ok([aBasicFolder(), aBasicFolder()]))),
        saveBasicFolders: jest.fn(),
        getBasicFolderById: jest.fn(),
        deleteBasicFolderByIds: jest.fn(),
        getBasicFoldersTimestamp: jest.fn(),
        saveBasicFoldersTimestamp: jest.fn(),
        getBasicFoldersIdsAndsUpdatedAt: jest.fn(),
    };

    const mockGetBasicFolders = (value: Result<BasicFolder[]>) => {
        basicFoldersRepository.getBasicFolders = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockGetBasicFolderById = (value: Result<BasicFolder>) => {
        basicFoldersRepository.getBasicFolderById = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockGetBasicFoldersTimestamp = (value: Result<NullableTimestamp>) => {
        basicFoldersRepository.getBasicFoldersTimestamp = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    const mockGetBasicFoldersIdsAndsUpdatedAt = (value: Result<FoldersIdsAndsUpdatedAt>) => {
        basicFoldersRepository.getBasicFoldersIdsAndsUpdatedAt = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    return {
        mockGetBasicFolders,
        mockGetBasicFolderById,
        mockGetBasicFoldersTimestamp,
        mockGetBasicFoldersIdsAndsUpdatedAt,
        basicFoldersRepository: () => basicFoldersRepository,
    };
};
