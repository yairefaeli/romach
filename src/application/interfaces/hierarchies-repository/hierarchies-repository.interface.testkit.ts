import { HierarchiesRepositoryInterface } from './hierarchies-repository.interface';

export const HierarchiesRepositoryTestkit = () => {
    const hierarchiesRepositoryInterface: HierarchiesRepositoryInterface = {
        getHierarchies: jest.fn(),
        saveHierarchies: jest.fn(),
    };

    const mockGetHierarchies = (value: ReturnType<HierarchiesRepositoryInterface['getHierarchies']>) => {
        hierarchiesRepositoryInterface.getHierarchies = jest.fn().mockReturnValue(value);
    };

    return {
        mockGetHierarchies,
        hierarchiesRepository: () => hierarchiesRepositoryInterface,
    };
};
