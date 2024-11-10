import { FlowUtils } from '../../../utils/FlowUtils/FlowUtils';
import { Result } from 'rich-domain';
import { BehaviorSubject } from 'rxjs';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { jest } from '@jest/globals';
import { romachEntitiesApiInterfaceMockBuilder } from 'src/application/mocks/romach-entities-interface.mock';
import { BasicFoldersReplicationUseCase } from './basic-folder-replication-use-case.service';

describe('BasicFoldersReplicationUseCase', () => {
  const leaderElectionSubject = new BehaviorSubject<boolean>(true);

  function createTest() {
    const mockApi = romachEntitiesApiInterfaceMockBuilder();

    const leaderElectionMock = leaderElectionInterfaceMockBuilder();
    leaderElectionMock.isLeader = () => leaderElectionSubject.asObservable();

    const mockRepository: jest.Mocked<RomachRepositoryInterface> = {
      getBasicFoldersTimestamp: jest.fn(),
      saveBasicFoldersTimestamp: jest.fn(),
    } as any;

    const loggerMock = mockAppLoggerServiceBuilder({
      print: true,
      debug: true,
    });

    const handlerMock = jest.fn(async (basicFolders: any[]) => Result.Ok<void, string, {}>(undefined));

    mockApi.getBasicFoldersByTimestamp = jest
      .fn()
      .mockRejectedValueOnce(new Error('error'))
      .mockResolvedValueOnce(Result.Ok([basicFoldersMock[0]]))
      .mockResolvedValueOnce(Result.Ok([basicFoldersMock[0], basicFoldersMock[1]]))
      .mockRejectedValueOnce(new Error('error'))
      .mockResolvedValue(Result.Ok([]));

    const pollInterval = 100;

    const options = {
      romachApi: mockApi,
      romachRepository: mockRepository,
      leaderElection: leaderElectionMock,
      pollInterval: pollInterval,
      retryInterval: 50,
      maxRetry: 3,
      handler: handlerMock,
      logger: loggerMock,
    };

    const service = new BasicFoldersReplicationUseCase(options);

    return {
      service,
      mockApi,
      leaderElectionMock,
      loggerMock,
      handlerMock,
      mockRepository,
    };
  }

  it('should be defined', () => {
    const { service } = createTest();
    expect(service).toBeDefined();
  });

  it('valid input', async () => {
    const { service, mockApi, handlerMock } = createTest();

    const subscription = service.execute().subscribe();
    await FlowUtils.delay(500);
    leaderElectionSubject.next(false);
    subscription.unsubscribe();

    expect(mockApi.getBasicFoldersByTimestamp).toHaveBeenCalledTimes(7);
    expect(handlerMock).toHaveBeenCalledTimes(2);
  });
});
function leaderElectionInterfaceMockBuilder() {
  throw new Error('Function not implemented.');
}

function mockAppLoggerServiceBuilder(arg0: { print: boolean; debug: boolean; }) {
  throw new Error('Function not implemented.');
}

