import { aHierarchy, aHierarchyList } from '../../../utils/builders/Hierarchy/hierarchy.builder';
import { HierarchiesRepositoryInterface } from './hierarchies-repository.interface';

export const HierarchiesRepositoryTestkit = () => {
    const hierarchiesRepositoryInterface: HierarchiesRepositoryInterface = {
        getHierarchies: jest.fn().mockResolvedValue(aHierarchy()),
        saveHierarchies: jest.fn().mockResolvedValue(aHierarchyList()),
    };

    const mockGetHierarchies = (value: Awaited<ReturnType<HierarchiesRepositoryInterface['getHierarchies']>>) => {
        hierarchiesRepositoryInterface.getHierarchies = jest.fn().mockResolvedValue(value);
    };

    const mockSaveHierarchies = (value: Awaited<ReturnType<HierarchiesRepositoryInterface['saveHierarchies']>>) => {
        hierarchiesRepositoryInterface.saveHierarchies = jest.fn().mockResolvedValue(value);
    };

    return {
        mockGetHierarchies,
        mockSaveHierarchies,
        hierarchiesRepository: () => hierarchiesRepositoryInterface,
    };
};
