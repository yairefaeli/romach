import { HierarchiesRepositoryInterface } from '../interfaces/hierarchies-interface/hierarchies.interface';

export function repositoryInitialHierarchiesBuilder(): HierarchiesRepositoryInterface {
    return {
        saveHierarchies: jest.fn(),
        getHierarchies: jest.fn(),
    };
}
