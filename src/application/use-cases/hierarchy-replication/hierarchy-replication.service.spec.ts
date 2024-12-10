import { BasicFoldersRepositoryInterface } from 'src/application/interfaces/basic-folders-repository/basic-folders-repository.interface';
import { HierarchiesRepositoryInterface } from 'src/application/interfaces/hierarchies-repository/hierarchies-repository.interface';
import { HierarchyReplicationService, HierarchyReplicationServiceOptions } from './hierarchy-replication.service';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entites-api/romach-entities-api.interface';
import { romachEntitiesApiInterfaceMockBuilder } from '../../mocks/romach-entities-interface.mock';
import { leaderElectionInterfaceMockBuilder } from '../../mocks/leader-election-interface.mock';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { mockAppLoggerServiceBuilder } from '../../mocks/app-logger.mock';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Tree } from 'src/domain/entities/Tree';
import { Result } from 'rich-domain';
import { map, timer } from 'rxjs';

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
        fetchHierarchies?: () => Promise<Result<Hierarchy[], string>>;
    }): RomachEntitiesApiInterface {
        return {
            ...romachEntitiesApiInterfaceMockBuilder(),
            fetchHierarchies:
                options?.fetchHierarchies ??
                jest
                    .fn()
                    .mockResolvedValueOnce(Result.Ok([]))
                    .mockResolvedValueOnce(Result.Ok([mockHierarchies[0]]))
                    .mockResolvedValue(Result.Ok([mockHierarchies[1]])),
        };
    }

    function mockLeaderElectionInterfaceBuilder(
        input: boolean[] = [],
        interval: number = 1000,
    ): LeaderElectionInterface {
        return {
            ...leaderElectionInterfaceMockBuilder(),
            isLeader: jest.fn().mockReturnValueOnce(timer(0, interval).pipe(map(() => input.shift()))),
        };
    }

    function mockRomacBasicFoldersRepositoryBuilder(): BasicFoldersRepositoryInterface {
        return;
    }

    function mockRomacHierarchiesRepositoryBuilder(
        initialHierarchies: Hierarchy[] = [],
    ): HierarchiesRepositoryInterface {
        let hierarchies: Hierarchy[] = initialHierarchies;
        const saveHierarchies = jest.fn().mockImplementation((hierarchy) => {
            hierarchies = hierarchy;
            return Promise.resolve(Result.Ok());
        });

        const getHierarchies = jest.fn().mockImplementation((reality) => {
            return Promise.resolve(Result.Ok(hierarchies));
        });
        return {
            ...mockRomacHierarchiesRepositoryBuilder(),
            saveHierarchies,
            getHierarchies,
        };
    }

    function mockTreeCalculationServiceBuilder(options?: {
        calculateTree?: (basicFolders: BasicFolder[], hierarchies: Hierarchy[]) => Tree;
    }): { calculateTree: (basicFolders: BasicFolder[], hierarchies: Hierarchy[]) => Tree } {
        return {
            calculateTree:
                options?.calculateTree ??
                ((basicFolders, hierarchies) => {
                    return {
                        updatedAt: Timestamp.now(),
                        nodes: [],
                    };
                }),
        };
    }

    async function testingModuleBuilder(input?: Partial<HierarchyReplicationServiceOptions>) {
        const options: HierarchyReplicationServiceOptions = {
            reality: 'reality1',
            interval: 1000,
            logger: mockAppLoggerServiceBuilder(),
            romachEntitiesApi: mockRomachApiInterfaceBuilder(),
            leaderElection: mockLeaderElectionInterfaceBuilder(),
            hierarchyRepositoryInterface: mockRomacHierarchiesRepositoryBuilder(),
            basicFolderRepositoryInterface: mockRomacBasicFoldersRepositoryBuilder(),
            treeCalculationService: mockTreeCalculationServiceBuilder(),
            maxRetry: 3,
            ...input,
        } as HierarchyReplicationServiceOptions;

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
        fetchHierarchies: jest.Mock;
        duration: number;
        repositoryInitialHierarchies?: Hierarchy[];
        leaderElectionPollInterval: number;
        fetchHierarchiesPollInterval: number;
        fetchHierarchiesExpectedCalls: number;
        saveHierarchiesExpectedCalls: number;
    }

    function scenarioTestBuilder(options: ScenarioTestBuilderOptions) {
        const {
            reality,
            leaderElectionValues,
            fetchHierarchies,
            duration,
            repositoryInitialHierarchies,
            leaderElectionPollInterval,
            fetchHierarchiesPollInterval,
            fetchHierarchiesExpectedCalls,
            saveHierarchiesExpectedCalls,
        } = options;
        return (done) => {
            const mockRomachApiInterface = mockRomachApiInterfaceBuilder({
                fetchHierarchies,
            });
            const mockRomachRepositoryInterface = mockRomacHierarchiesRepositoryBuilder(repositoryInitialHierarchies);
            const mockHierarchyLeaderElectionInterface = mockLeaderElectionInterfaceBuilder(
                leaderElectionValues,
                leaderElectionPollInterval,
            );

            testingModuleBuilder({
                romachEntitiesApi: mockRomachApiInterface,
                leaderElection: mockHierarchyLeaderElectionInterface,
                hierarchyRepositoryInterface: mockRomachRepositoryInterface,
                logger: mockAppLoggerServiceBuilder(),
                reality,
                interval: fetchHierarchiesPollInterval,
            }).then(({ service }) => {
                const subscription = service.execute().subscribe();

                setTimeout(() => {
                    subscription.unsubscribe();
                    try {
                        expect(mockRomachApiInterface.fetchHierarchies).toHaveBeenCalledTimes(
                            fetchHierarchiesExpectedCalls,
                        );
                        expect(mockRomachRepositoryInterface.saveHierarchies).toHaveBeenCalledTimes(
                            saveHierarchiesExpectedCalls,
                        );
                        done();
                    } catch (error) {
                        done(error);
                    }
                }, duration);
            });
        };
    }
    it(
        'when leader is true, should call fetchHierarchies',
        scenarioTestBuilder({
            reality: 'reality1',
            leaderElectionValues: [true],
            fetchHierarchies: jest.fn().mockResolvedValue(Result.Ok([])),
            duration: 1000,
            leaderElectionPollInterval: 2000,
            fetchHierarchiesPollInterval: 100,
            fetchHierarchiesExpectedCalls: 10,
            saveHierarchiesExpectedCalls: 0,
        }),
    );

    it(
        'when leader is changed to false, should not call fetchHierarchies',
        scenarioTestBuilder({
            reality: 'reality1',
            leaderElectionValues: [true, false],
            fetchHierarchies: jest.fn().mockResolvedValue(Result.Ok([])),
            duration: 1000,
            leaderElectionPollInterval: 500,
            fetchHierarchiesPollInterval: 100,
            fetchHierarchiesExpectedCalls: 5,
            saveHierarchiesExpectedCalls: 0,
        }),
    );

    it(
        'when leader is true, should call fetchHierarchies, fetch and print mock hierarchies',
        scenarioTestBuilder({
            reality: 'reality1',
            leaderElectionValues: [true],
            fetchHierarchies: jest.fn().mockImplementation(() => {
                const hierarchies = [hierarchy1, hierarchy2];
                console.log('Fetched hierarchies:', hierarchies);
                return Promise.resolve(Result.Ok(hierarchies));
            }),
            duration: 1000,
            leaderElectionPollInterval: 500,
            fetchHierarchiesPollInterval: 100,
            fetchHierarchiesExpectedCalls: 5,
            saveHierarchiesExpectedCalls: 0,
        }),
    );
});
