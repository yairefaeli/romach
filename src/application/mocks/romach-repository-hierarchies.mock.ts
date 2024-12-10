import { HierarchiesRepositoryInterface } from '../interfaces/hierarchies-repository/hierarchies-repository.interface';

export function repositoryInitialHierarchiesBuilder(): HierarchiesRepositoryInterface {
    return {
        saveHierarchies: jest.fn(),
        getHierarchies: jest.fn(),
    };
}
