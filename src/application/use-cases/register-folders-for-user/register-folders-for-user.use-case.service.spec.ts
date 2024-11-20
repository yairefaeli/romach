import { romachRepositoryInterfaceMockBuilder } from '../../mocks/romach-repository-interface.mock';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';
import { Result } from 'rich-domain';
import { RegisterFoldersForUserUseCase } from './register-folders-for-user.use-case.service';

describe('RegisterFoldersForUserUseCase', () => {
  function mockRegisteredFolder(folderId: string): RegisteredFolder {
    return {
      getProps: jest.fn().mockReturnValue({ folderId }),
    } as unknown as RegisteredFolder;
  }

  function mockRomachRepositoryInterfaceBuilder() {
    return romachRepositoryInterfaceMockBuilder();
  }

  function mockLogger(): AppLoggerService {
    return {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    } as unknown as AppLoggerService;
  }

  async function testingModuleBuilder(options?: {
    registeredFolders?: RegisteredFolder[];
    deleteFoldersError?: string;
    updateFoldersError?: string;
    maxRetry?: number;
  }) {
    const logger = mockLogger();
    const romachRepository = mockRomachRepositoryInterfaceBuilder();

    const getRegisteredFoldersByUpn = jest
      .fn()
      .mockResolvedValue(Result.Ok(options?.registeredFolders || []));
    romachRepository.getRegisteredFoldersByUpn = getRegisteredFoldersByUpn;

    romachRepository.deleteRegisteredFoldersByIdsForUpn = jest
      .fn()
      .mockResolvedValue(
        options?.deleteFoldersError
          ? Result.fail(options.deleteFoldersError)
          : Result.Ok(),
      );

    romachRepository.updateRegistrationByUpnAndFolderIds = jest
      .fn()
      .mockResolvedValue(
        options?.updateFoldersError
          ? Result.fail(options.updateFoldersError)
          : Result.Ok(),
      );

    const useCase = new RegisterFoldersForUserUseCase({
      logger,
      repository: romachRepository,
      maxRetry: options?.maxRetry || 3,
    });

    return { useCase, logger, romachRepository };
  }

  it('should be defined', async () => {
    const { useCase } = await testingModuleBuilder();
    expect(useCase).toBeDefined();
  });

  interface ScenarioTestBuilderOptions {
    input: { reality: string; upn: string; folderIds: string[] };
    registeredFolders: RegisteredFolder[];
    deleteFoldersError?: string;
    updateFoldersError?: string;
    maxRetry?: number;
    expectedLogs: { info: string[]; debug: string[]; error: string[] };
    expectedResult: Result<void>;
  }

  function scenarioTestBuilder(options: ScenarioTestBuilderOptions) {
    const {
      input,
      registeredFolders,
      deleteFoldersError,
      updateFoldersError,
      maxRetry,
      expectedLogs,
      expectedResult,
    } = options;

    return (done) => {
      testingModuleBuilder({
        registeredFolders,
        deleteFoldersError,
        updateFoldersError,
        maxRetry,
      }).then(({ useCase, logger, romachRepository }) => {
        useCase
          .execute(input)
          .then((result) => {
            try {
              expect(result.isOk()).toBe(expectedResult.isOk());
              if (result.isFail()) {
                expect(result.error()).toBe(expectedResult.error());
              }

              // Verify logger calls
              expectedLogs.info.forEach((log) =>
                expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(log)),
              );
              expectedLogs.debug.forEach((log) =>
                expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining(log)),
              );
              expectedLogs.error.forEach((log) =>
                expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(log)),
              );

              done();
            } catch (error) {
              done(error);
            }
          })
          .catch((error) => done(error));
      });
    };
  }

  it(
    'should partition folders and update relevant ones',
    scenarioTestBuilder({
      input: { reality: 'reality1', upn: 'user1', folderIds: ['folder1', 'folder2'] },
      registeredFolders: [
        mockRegisteredFolder('folder1'),
        mockRegisteredFolder('folder3'),
      ],
      expectedLogs: {
        info: ['Starting folder registration process', 'Folder registration process completed'],
        debug: ['Partitioning folders', 'Partitioned folders: 1 relevant, 1 irrelevant'],
        error: [],
      },
      expectedResult: Result.Ok(),
    }),
  );

  it(
    'should return an error when deleting irrelevant folders fails',
    scenarioTestBuilder({
      input: { reality: 'reality1', upn: 'user1', folderIds: ['folder1'] },
      registeredFolders: [
        mockRegisteredFolder('folder1'),
        mockRegisteredFolder('folder2'),
      ],
      deleteFoldersError: 'Failed to delete folders',
      expectedLogs: {
        info: ['Starting folder registration process'],
        debug: ['Partitioning folders', 'Partitioned folders: 1 relevant, 1 irrelevant'],
        error: ['Failed to delete irrelevant folders'],
      },
      expectedResult: Result.fail('Failed to delete folders'),
    }),
  );

  it(
    'should return an error when updating relevant folders fails',
    scenarioTestBuilder({
      input: { reality: 'reality1', upn: 'user1', folderIds: ['folder1', 'folder2'] },
      registeredFolders: [
        mockRegisteredFolder('folder1'),
        mockRegisteredFolder('folder2'),
      ],
      updateFoldersError: 'Failed to update folders',
      expectedLogs: {
        info: ['Starting folder registration process'],
        debug: ['Partitioning folders', 'Partitioned folders: 2 relevant, 0 irrelevant'],
        error: ['Failed to update registration timestamps'],
      },
      expectedResult: Result.fail('Failed to update folders'),
    }),
  );
});
