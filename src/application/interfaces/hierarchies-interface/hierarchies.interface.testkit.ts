import { HierarchiesRepositoryInterface } from './hierarchies.interface';

export const HierarchiesRepositoryTestkit = () => {
    const hierarchiesRepositoryInterface: HierarchiesRepositoryInterface = {
        getHierarchies: jest.fn(),
        saveHierarchies: jest.fn(),
    };

    const mockGetHierarchies = (value: HierarchiesRepositoryInterface['getHierarchies']) => {
        hierarchiesRepositoryInterface.getHierarchies = jest.fn().mockReturnValue(value);
    };

    const mockSaveHierarchies = (value: HierarchiesRepositoryInterface['saveHierarchies']) => {
        hierarchiesRepositoryInterface.saveHierarchies = jest.fn().mockReturnValue(value);
    };

    return {
        mockGetHierarchies,
        mockSaveHierarchies,
        hierarchiesRepositoryInterface: () => hierarchiesRepositoryInterface,
    };
};
