import { romachEntitiesApiInterfaceMockBuilder } from '../../mocks/romach-entities-interface.mock';
import { AddProtectedFolderToUserUseCase } from './add-protected-folder-to-user.use-case.service';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { folderMock } from '../../mocks/entities.mock';
import { Result } from 'rich-domain';

describe('AddProtectedFolderToUserUseCase', () => {
    function createTest() {
        const mockRepo = romachRepositoryInterfaceMockBuilder();
        const mockApi = romachEntitiesApiInterfaceMockBuilder();
        const mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
        } as unknown as AppLoggerService;

        const mockFolderService = {
            upsertGeneralError: jest.fn(),
            upsertWrongPassword: jest.fn(),
            upsertValid: jest.fn().mockResolvedValue(Result.Ok()),
        };

        const mockFolder = folderMock[0];

        mockApi.checkPassword = jest.fn(async (id: string, password: string) => {
            if (id === '1') return Result.fail('not-found');
            return Result.Ok(true); // Simulate correct password
        });

        mockApi.fetchFolderByIdAndPassword = jest.fn(async ({ folderId }) => {
            if (folderId === '1') return Result.fail('not-found');
            return Result.Ok(mockFolder);
        });

        mockRepo.getBasicFolderById = jest.fn(async (id: string) => {
            if (id === '1') return Result.fail('not-found');
            return Result.Ok({ getProps: jest.fn().mockReturnValue({ isPasswordProtected: true }) });
        });

        const service = new AddProtectedFolderToUserUseCase(mockLogger, mockRepo, mockApi, mockFolderService);

        return { service, mockRepo, mockApi, mockLogger, mockFolderService };
    }

    it('should be defined', () => {
        const { service } = createTest();
        expect(service).toBeDefined();
    });

    it('should handle valid input and upsert folder', async () => {
        const { service, mockApi, mockFolderService } = createTest();

        const result = await service.execute({
            upn: 'test-user',
            password: 'test-password',
            folderId: '0',
        });

        expect(mockApi.checkPassword).toHaveBeenCalledTimes(1);
        expect(mockApi.fetchFolderByIdAndPassword).toHaveBeenCalledTimes(1);
        expect(mockFolderService.upsertValid).toHaveBeenCalledTimes(1);
        expect(result.isOk()).toBe(true);
    });

    it('should handle folder ID not found', async () => {
        const { service, mockRepo, mockFolderService } = createTest();

        const result = await service.execute({
            upn: 'test-user',
            password: 'test-password',
            folderId: '1',
        });

        expect(mockRepo.getBasicFolderById).toHaveBeenCalledTimes(1);
        expect(mockFolderService.upsertGeneralError).toHaveBeenCalledTimes(1);
        expect(result.isFail()).toBe(true);
    });

    it('should handle incorrect password for protected folder', async () => {
        const { service, mockApi, mockFolderService } = createTest();

        mockApi.checkPassword = jest.fn(async () => Result.Ok(false));

        const result = await service.execute({
            upn: 'test-user',
            password: 'wrong-password',
            folderId: '0',
        });

        expect(mockApi.checkPassword).toHaveBeenCalledTimes(1);
        expect(mockFolderService.upsertWrongPassword).toHaveBeenCalledTimes(1);

        expect(result.isFail()).toBe(true);
    });

    it('should handle failure when fetching folder by ID and password', async () => {
        const { service, mockApi, mockFolderService } = createTest();
        mockApi.fetchFolderByIdAndPassword = jest.fn(async () => Result.fail('not-found'));

        const result = await service.execute({
            upn: 'test-user',
            password: 'test-password',
            folderId: '0',
        });

        expect(mockApi.fetchFolderByIdAndPassword).toHaveBeenCalledTimes(1);
        expect(mockFolderService.upsertGeneralError).toHaveBeenCalledTimes(1);
        expect(result.isFail()).toBe(true);
    });
});

function romachRepositoryInterfaceMockBuilder() {
    return {
        getBasicFolderById: jest.fn(),
        // Add other methods as needed for the tests
    };
}
