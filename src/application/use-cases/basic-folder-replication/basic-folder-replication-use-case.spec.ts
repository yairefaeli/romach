import {
    BasicFolderReplicationHandlerFn,
    BasicFoldersReplicationUseCase,
    BasicFoldersReplicationUseCaseOptions,
} from './basic-folder-replication-use-case.service';
import { repositoryInitialBasicFolderBuilder } from '../../mocks/romach-repository-basic-folder.mock';
import { romachEntitiesApiInterfaceMockBuilder } from '../../mocks/romach-entities-interface.mock';
import { leaderElectionInterfaceMockBuilder } from '../../mocks/leader-election-interface.mock';
import { mockAppLoggerServiceBuilder } from '../../mocks/app-logger.mock';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { FlowUtils } from '../../../utils/FlowUtils/FlowUtils';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { BehaviorSubject } from 'rxjs';
import { jest } from '@jest/globals';
import { Result } from 'rich-domain';

describe('BasicFoldersReplicationUseCase', () => {
    function createTest() {
        const leaderElectionSubject = new BehaviorSubject<boolean>(true);
        const leaderElectionMock = leaderElectionInterfaceMockBuilder();
        leaderElectionMock.isLeader = () => leaderElectionSubject.asObservable();

        const mockApi = romachEntitiesApiInterfaceMockBuilder();

        const mockRepository = repositoryInitialBasicFolderBuilder();

        // @ts-ignore

        mockRepository.getBasicFoldersTimestamp = jest.fn().mockReturnValue(Result.Ok(null));

        // @ts-ignore
        mockRepository.saveBasicFoldersTimestamp = jest.fn().mockReturnValue(Result.Ok());

        const loggerMock = mockAppLoggerServiceBuilder({
            print: true,
            debug: true,
        });

        // @ts-ignore
        const handlerMock: BasicFolderReplicationHandlerFn = jest.fn().mockReturnValue(Result.Ok());

        //@ts-ignore
        mockApi.fetchBasicFoldersByTimestamp = jest
            .fn()
            .mockReturnValueOnce(Result.Ok([]))
            .mockReturnValueOnce(
                Result.Ok([
                    BasicFolder.create({
                        id: '1',
                        name: 'aaa',
                        deleted: false,
                        isLocal: false,
                        isPasswordProtected: false,
                        creationDate: Timestamp.now().toString(),
                        updatedAt: Timestamp.now(),
                        categoryId: 'category1',
                    }).value(),
                ]),
            )
            .mockReturnValueOnce(
                Result.Ok([
                    BasicFolder.create({
                        id: '2',
                        name: 'bbb',
                        deleted: false,
                        isLocal: false,
                        isPasswordProtected: false,
                        creationDate: Timestamp.now().toString(),
                        updatedAt: Timestamp.now(),
                        categoryId: 'category2',
                    }).value(),
                ]),
            )
            .mockReturnValue(Result.Ok([]));

        const options: BasicFoldersReplicationUseCaseOptions = {
            romachApi: mockApi,
            romachBasicFolderRepositoryInterface: mockRepository,
            leaderElection: leaderElectionMock,
            pollInterval: 100,
            retryInterval: 300,
            maxRetry: 1,
            handler: handlerMock,
            logger: loggerMock,
        };

        const replicator = new BasicFoldersReplicationUseCase(options);

        return {
            leaderElectionSubject,
            replicator,
            mockApi,
            leaderElectionMock,
            loggerMock,
            handlerMock,
            mockRepository,
        };
    }

    it('should be defined', () => {
        const { replicator, handlerMock } = createTest();
        expect(handlerMock([])).toEqual(Result.Ok());
        expect(replicator).toBeDefined();
    });

    it('valid input', async () => {
        const { replicator, mockApi, handlerMock, leaderElectionSubject } = createTest();

        const subscription = replicator.execute().subscribe();
        await FlowUtils.delay(600);
        leaderElectionSubject.next(false);
        subscription.unsubscribe();

        expect(mockApi.fetchBasicFoldersByTimestamp).toHaveBeenCalledTimes(6);
        expect(handlerMock).toHaveBeenCalledTimes(6);
    }, 5000);
});
