import { HierarchiesRepositoryInterface } from './hierarchies.interface';
import { Hierarchy } from '../../../domain/entities/hierarchy';
import { Result } from 'rich-domain';

export const HierarchiesRepositoryTestkit = () => {
    const hierarchiesRepositoryInterface: HierarchiesRepositoryInterface = {
        getHierarchies: jest.fn(),
        saveHierarchies: jest.fn(),
    };

    const mockGetHierarchies = (value: Result<Hierarchy[]>) => {
        hierarchiesRepositoryInterface.getHierarchies = jest.fn().mockReturnValue(Promise.resolve(value));
    };

    return {
        mockGetHierarchies,
        hierarchiesRepository: () => hierarchiesRepositoryInterface,
    };
};
