import {
  HierarchyReplicationService,
  HierarchyReplicationServiceOptions,
} from './hierarchy-replication.service';
import { romachRepositoryInterfaceMockBuilder } from '../../mocks/romach-repository-interface.mock';
import { romachEntitiesApiInterfaceMockBuilder } from '../../mocks/romach-entities-interface.mock';
import { leaderElectionInterfaceMockBuilder } from '../../mocks/leader-election-interface.mock';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { mockAppLoggerServiceBuilder } from '../../mocks/app-logger.mock';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';
import { map, timer } from 'rxjs';
import { TreeCalculationService } from 'src/domain/services/tree-calculation/tree-calculation.service';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Tree } from 'src/domain/entities/Tree';
import { Timestamp } from 'src/domain/entities/Timestamp';

describe('HierarchyReplicationService', () => {
  const hierarchy1 = Hierarchy.create({
    id: '1',
    name: 'name1',
    displayName: 'displayName1',
    children: [],
  }).value();
  const hierarchy2 = Hierarchy.create({
    id: '2',
    name: 'name2',
    displayName: 'displayName2',
    children: [],
  }).value();
  const mockHierarchies: Hierarchy[] = [hierarchy1, hierarchy2];

  function mockRomachApiInterfaceBuilder(options?: {
    getHierarchies?: () => Promise<Result<Hierarchy[]>>;
  }): RomachEntitiesApiInterface {
    return {
      ...romachEntitiesApiInterfaceMockBuilder(),
      getHierarchies:
        options?.getHierarchies ??
        jest
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([mockHierarchies[0]])
          .mockResolvedValue([mockHierarchies[1]]),
    };
  }

  function mockLeaderElectionInterfaceBuilder(
    input: boolean[] = [],
    interval: number = 1000,
  ): LeaderElectionInterface {
    return {
      ...leaderElectionInterfaceMockBuilder(),
      isLeader: jest
        .fn()
        .mockReturnValueOnce(timer(0, interval).pipe(map(() => input.shift()))),
    };
  }

  function mockRomachRepositoryInterfaceBuilder(
    initialHierarchies: Hierarchy[] = [],
  ): RomachRepositoryInterface {
    let hierarchies: Hierarchy[] = initialHierarchies;
    const saveHierarchies = jest.fn().mockImplementation((hierarchy) => {
      hierarchies = hierarchy;
      return Promise.resolve();
    });

    const getHierarchies = jest.fn().mockImplementation((reality) => {
      return Promise.resolve(hierarchies);
    });
    return {
      ...romachRepositoryInterfaceMockBuilder(),
      saveHierarchies,
      getHierarchies,
    };
  }

  function mockTreeCalculationServiceBuilder(options?: {
    calculateTree?: (basicFolders: BasicFolder[], hierarchies: Hierarchy[]) => Tree;
  }): TreeCalculationService {
    return {
      calculateTree: options?.calculateTree ?? ((basicFolders, hierarchies) => {
        return {
          updatedAt: Timestamp.now(),
          nodes: [],
        };
      }),
    };
  }

  async function testingModuleBuilder(
    input?: Partial<HierarchyReplicationServiceOptions>,
  ) {
    const options: HierarchyReplicationServiceOptions = {
      reality: 'reality1',
      interval: 1000,
      logger: mockAppLoggerServiceBuilder(),
      romachEntitiesApi: mockRomachApiInterfaceBuilder(),
      leaderElection: mockLeaderElectionInterfaceBuilder(),
      romachRepository: mockRomachRepositoryInterfaceBuilder(),
      treeCalculationService: mockTreeCalculationServiceBuilder(),
      maxRetry: 3,
      ...input,
    };

    return {
      service: new HierarchyReplicationService(options),
      options,
    };
  }

  it('should be defined', async () => {
    const { service } = await testingModuleBuilder();
    expect(service).toBeDefined();
  });

  interface ScenarioTestBuilderOptions {
    reality: string;
    leaderElectionValues: boolean[];
    getHierarchies: jest.Mock;
    duration: number;
    repositoryInitialHierarchies?: Hierarchy[];
    leaderElectionPollInterval: number;
    getHierarchiesPollInterval: number;
    getHierarchiesExpectedCalls: number;
    saveHierarchiesExpectedCalls: number;
  }

  function scenarioTestBuilder(options: ScenarioTestBuilderOptions) {
    const {
      reality,
      leaderElectionValues,
      getHierarchies,
      duration,
      repositoryInitialHierarchies,
      leaderElectionPollInterval,
      getHierarchiesPollInterval,
      getHierarchiesExpectedCalls,
      saveHierarchiesExpectedCalls,
    } = options;
    return (done) => {
      const mockRomachApiInterface = mockRomachApiInterfaceBuilder({
        getHierarchies,
      });
      const mockRomachRepositoryInterface =
        mockRomachRepositoryInterfaceBuilder(repositoryInitialHierarchies);
      const mockHierarchyLeaderElectionInterface =
        mockLeaderElectionInterfaceBuilder(
          leaderElectionValues,
          leaderElectionPollInterval,
        );

      testingModuleBuilder({
        romachEntitiesApi: mockRomachApiInterface,
        leaderElection: mockHierarchyLeaderElectionInterface,
        romachRepository: mockRomachRepositoryInterface,
        logger: mockAppLoggerServiceBuilder(),
        reality,
        interval: getHierarchiesPollInterval,
      }).then(({ options, service }) => {
        const subscription = service.execute().subscribe();

        setTimeout(() => {
          subscription.unsubscribe();
          try {
            expect(mockRomachApiInterface.getHierarchies).toHaveBeenCalledTimes(
              getHierarchiesExpectedCalls,
            );
            expect(
              mockRomachRepositoryInterface.saveHierarchies,
            ).toHaveBeenCalledTimes(saveHierarchiesExpectedCalls);
            done();
          } catch (error) {
            done(error);
          }
        }, duration);
      });
    };
  }

  it(
    'when leader is true, should call getHierarchies',
    scenarioTestBuilder({
      reality: 'reality1',
      leaderElectionValues: [true],
      getHierarchies: jest.fn().mockResolvedValue([]),
      duration: 1000,
      leaderElectionPollInterval: 2000,
      getHierarchiesPollInterval: 100,
      getHierarchiesExpectedCalls: 10,
      saveHierarchiesExpectedCalls: 0,
    }),
  );
  it(
    'when leader is changed to false, should not call getHierarchies',
    scenarioTestBuilder({
      reality: 'reality1',
      leaderElectionValues: [true, false],
      getHierarchies: jest.fn().mockResolvedValue([]),
      duration: 1000,
      leaderElectionPollInterval: 500,
      getHierarchiesPollInterval: 100,
      getHierarchiesExpectedCalls: 5,
      saveHierarchiesExpectedCalls: 0,
    }),
  );

  it(
    'when hierarchies changed 2 times, should call saveHierarchies 2 times',
    scenarioTestBuilder({
      reality: 'reality1',
      leaderElectionValues: [true],
      repositoryInitialHierarchies: [],
      getHierarchies: jest
        .fn()
        .mockResolvedValueOnce([]) // same a initial
        .mockResolvedValueOnce([mockHierarchies[0]])
        .mockResolvedValue([]),
      duration: 1000,
      leaderElectionPollInterval: 4000,
      getHierarchiesPollInterval: 300,
      getHierarchiesExpectedCalls: 4,
      saveHierarchiesExpectedCalls: 2,
    }),
  );
});
