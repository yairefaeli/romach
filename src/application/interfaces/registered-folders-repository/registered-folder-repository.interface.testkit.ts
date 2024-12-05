import { aValidRegisteredFoldersList } from '../../../utils/builders/RegisteredFolder/valid-registered-folder.builder';
import { RegisteredFolderRepositoryInterface } from './registered-folder-repository.interface';
import { Result } from 'rich-domain';

export const RegisteredFolderRepositoryTestkit = () => {
    const registeredFolderRepository: RegisteredFolderRepositoryInterface = {
        upsertRegisteredFolder: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
        upsertRegisteredFolders: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
        deleteRegisteredFoldersByIds: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
        deleteRegisteredFoldersByIdsForUpn: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
        updateRegistrationByUpnAndFolderIds: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
        getRegisteredFoldersByUpn: jest.fn().mockReturnValue(Promise.resolve(Result.Ok(aValidRegisteredFoldersList()))),
        getRegisteredFoldersByIds: jest.fn().mockReturnValue(Promise.resolve(Result.Ok(aValidRegisteredFoldersList()))),
        getRegisteredFoldersById: jest.fn().mockReturnValue(Promise.resolve(Result.Ok(aValidRegisteredFoldersList(1)))),
        getExpiredRegisteredFolders: jest
            .fn()
            .mockReturnValue(Promise.resolve(Result.Ok(aValidRegisteredFoldersList()))),
        getRegisteredFoldersByIdAndPassword: jest
            .fn()
            .mockReturnValue(Promise.resolve(Result.Ok(aValidRegisteredFoldersList(1)))),
        getRegisteredFoldersWithFailedStatus: jest
            .fn()
            .mockReturnValue(Promise.resolve(Result.Ok(aValidRegisteredFoldersList()))),
    };

    const mockUpsertRegisteredFolder = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['upsertRegisteredFolder']>>,
    ) => (registeredFolderRepository.upsertRegisteredFolder = jest.fn().mockReturnValue(Promise.resolve(value)));

    const mockUpsertRegisteredFolders = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['upsertRegisteredFolders']>>,
    ) => (registeredFolderRepository.upsertRegisteredFolders = jest.fn().mockReturnValue(Promise.resolve(value)));

    const mockGetRegisteredFoldersById = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['getRegisteredFoldersById']>>,
    ) => (registeredFolderRepository.getRegisteredFoldersById = jest.fn().mockReturnValue(Promise.resolve(value)));

    const mockGetRegisteredFoldersByUpn = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['getRegisteredFoldersByUpn']>>,
    ) => (registeredFolderRepository.getRegisteredFoldersByUpn = jest.fn().mockReturnValue(Promise.resolve(value)));

    const mockGetRegisteredFoldersByIds = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['getRegisteredFoldersByIds']>>,
    ) => (registeredFolderRepository.getRegisteredFoldersByIds = jest.fn().mockReturnValue(Promise.resolve(value)));

    const mockGetExpiredRegisteredFolders = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['getExpiredRegisteredFolders']>>,
    ) => (registeredFolderRepository.getExpiredRegisteredFolders = jest.fn().mockReturnValue(Promise.resolve(value)));

    const mockDeleteRegisteredFoldersByIds = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['deleteRegisteredFoldersByIds']>>,
    ) => (registeredFolderRepository.deleteRegisteredFoldersByIds = jest.fn().mockReturnValue(Promise.resolve(value)));

    const mockDeleteRegisteredFoldersByIdsForUpn = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['deleteRegisteredFoldersByIdsForUpn']>>,
    ) =>
        (registeredFolderRepository.deleteRegisteredFoldersByIdsForUpn = jest
            .fn()
            .mockReturnValue(Promise.resolve(value)));

    const mockUpdateRegistrationByUpnAndFolderIds = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['updateRegistrationByUpnAndFolderIds']>>,
    ) =>
        (registeredFolderRepository.updateRegistrationByUpnAndFolderIds = jest
            .fn()
            .mockReturnValue(Promise.resolve(value)));

    const mockGetRegisteredFoldersByIdAndPassword = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['getRegisteredFoldersByIdAndPassword']>>,
    ) =>
        (registeredFolderRepository.getRegisteredFoldersByIdAndPassword = jest
            .fn()
            .mockReturnValue(Promise.resolve(value)));

    const mockGetRegisteredFoldersWithFailedStatuses = (
        value: Awaited<ReturnType<RegisteredFolderRepositoryInterface['getRegisteredFoldersWithFailedStatus']>>,
    ) =>
        (registeredFolderRepository.getRegisteredFoldersWithFailedStatus = jest
            .fn()
            .mockReturnValue(Promise.resolve(value)));

    return {
        mockUpsertRegisteredFolder,
        mockUpsertRegisteredFolders,
        mockGetRegisteredFoldersById,
        mockGetRegisteredFoldersByUpn,
        mockGetRegisteredFoldersByIds,
        mockGetExpiredRegisteredFolders,
        mockDeleteRegisteredFoldersByIds,
        mockDeleteRegisteredFoldersByIdsForUpn,
        mockUpdateRegistrationByUpnAndFolderIds,
        mockGetRegisteredFoldersByIdAndPassword,
        mockGetRegisteredFoldersWithFailedStatuses,
        registeredFolderRepository: () => registeredFolderRepository,
    };
};
