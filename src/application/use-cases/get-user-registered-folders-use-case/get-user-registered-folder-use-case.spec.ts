import { GetUserRegisteredFoldersUseCase } from './get-user-registered-folders-use-case.service';
import { romachRepositoryInterfaceMockBuilder } from '../../mocks/romach-repository-interface.mock';
import { Result } from 'rich-domain';
import { RegisteredFolder } from 'src/domain/entities/RegisteredFolder';

describe('GetUserRegisteredFoldersUseCase', () => {
    function mockRegisteredFolder(folderId: string): RegisteredFolder {
        return {
            getProps: jest.fn().mockReturnValue({ folderId }),
        } as unknown as RegisteredFolder;
    }

    function mockRomachRepositoryInterfaceBuilder(
        registeredFolders: RegisteredFolder[] = [],
    ) {
        const getRegisteredFoldersByUpn = jest
            .fn()
            .mockResolvedValue(Result.Ok(registeredFolders));
        return {
            ...romachRepositoryInterfaceMockBuilder(),
            getRegisteredFoldersByUpn,
        };
    }

    async function testingModuleBuilder(
        input?: { registeredFolders: RegisteredFolder[]; getRegisteredFoldersByUpnError?: string },
    ) {
        const romachRepository = mockRomachRepositoryInterfaceBuilder(
            input?.registeredFolders || [],
        );

        if (input?.getRegisteredFoldersByUpnError) {
            romachRepository.getRegisteredFoldersByUpn = jest
                .fn()
                .mockResolvedValue(Result.fail(input.getRegisteredFoldersByUpnError));
        }

        return {
            useCase: new GetUserRegisteredFoldersUseCase(romachRepository),
            romachRepository,
        };
    }

    it('should be defined', async () => {
        const { useCase } = await testingModuleBuilder();
        expect(useCase).toBeDefined();
    });

    interface ScenarioTestBuilderOptions {
        upn: string;
        registeredFolders: RegisteredFolder[];
        getRegisteredFoldersByUpnError?: string;
        getRegisteredFoldersExpectedCalls: number;
        expectedResult: Result<{ ids: string[] }>;
    }

    function scenarioTestBuilder(options: ScenarioTestBuilderOptions) {
        const {
            upn,
            registeredFolders,
            getRegisteredFoldersByUpnError,
            getRegisteredFoldersExpectedCalls,
            expectedResult,
        } = options;

        return (done) => {
            testingModuleBuilder({ registeredFolders, getRegisteredFoldersByUpnError }).then(
                ({ useCase, romachRepository }) => {
                    useCase
                        .execute({ upn })
                        .then((result) => {
                            try {
                                expect(result.isOk()).toBe(expectedResult.isOk());
                                if (result.isOk()) {
                                    expect(result.value()).toEqual(expectedResult.value());
                                } else {
                                    expect(result.error()).toBe(expectedResult.error());
                                }

                                expect(
                                    romachRepository.getRegisteredFoldersByUpn,
                                ).toHaveBeenCalledTimes(getRegisteredFoldersExpectedCalls);
                                expect(
                                    romachRepository.getRegisteredFoldersByUpn,
                                ).toHaveBeenCalledWith(upn);

                                done();
                            } catch (error) {
                                done(error);
                            }
                        })
                        .catch((error) => done(error));
                },
            );
        };
    }

    it(
        'should return folder IDs when the repository succeeds',
        scenarioTestBuilder({
            upn: 'test-user@domain.com',
            registeredFolders: [
                mockRegisteredFolder('folder1'),
                mockRegisteredFolder('folder2'),
                mockRegisteredFolder('folder3'),
            ],
            getRegisteredFoldersExpectedCalls: 1,
            expectedResult: Result.Ok({ ids: ['folder1', 'folder2', 'folder3'] }),
        }),
    );

    it(
        'should return an error when the repository fails',
        scenarioTestBuilder({
            upn: 'test-user@domain.com',
            registeredFolders: [],
            getRegisteredFoldersByUpnError: 'Failed to fetch folders',
            getRegisteredFoldersExpectedCalls: 1,
            expectedResult: Result.fail('Failed to fetch folders'),
        }),
    );
});
