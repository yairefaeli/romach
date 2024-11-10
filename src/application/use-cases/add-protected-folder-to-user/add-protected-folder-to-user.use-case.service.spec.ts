import { romachRepositoryInterfaceMockBuilder } from '../../mocks/romach-repository-interface.mock';
import { romachEntitiesApiInterfaceMockBuilder } from '../../mocks/romach-entities-interface.mock';
import { AddProtectedFolderToUserUseCase } from './add-protected-folder-to-user.use-case.service';
import { RegisteredFolderErrorStatus } from '../../../domain/entities/RegisteredFolderStatus';
import { Folder } from '../../../domain/entities/Folder';
import { folderMock } from '../../mocks/entities.mock';
import { Result } from 'rich-domain';

describe('PasswordCheckerService', () => {
  function createTest() {
    const mockRepo = romachRepositoryInterfaceMockBuilder();
    const mockApi = romachEntitiesApiInterfaceMockBuilder();
    const mockFolder = folderMock[0];
    mockApi.checkPassword = jest
      .fn()
      .mockImplementation(
        async (
          id: string,
          password: string,
        ): Promise<Result<Folder, RegisteredFolderErrorStatus>> => {
          if (id === '1') return Result.fail('not-found');
          return Result.Ok(mockFolder);
        },
      );

    mockRepo.upsertRegisteredFolders = jest.fn().mockResolvedValue(Result.Ok());
    const service = new AddProtectedFolderToUserUseCase(mockRepo, mockApi);

    return { service, mockRepo, mockApi };
  }
  it('should be defined', () => {
    const { service } = createTest();
    expect(service).toBeDefined();
  });

  it('valid input', async () => {
    const { service, mockRepo, mockApi } = createTest();
    await service.execute({
      upn: '',
      password: '',
      folderId: '0',
    });

    expect(mockApi.checkPassword).toHaveBeenCalledTimes(1);
    expect(mockRepo.upsertRegisteredFolders).toHaveBeenCalledTimes(1);
  });
  it('folder id not found', async () => {
    const { service, mockRepo, mockApi } = createTest();
    await service.execute({
      upn: '',
      password: '',
      folderId: '1',
    });

    expect(mockApi.checkPassword).toHaveBeenCalledTimes(1);
    expect(mockRepo.upsertRegisteredFolders).toHaveBeenCalledTimes(0);
  });
});
