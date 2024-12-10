import { Hierarchy, HierarchyProps } from '../../../domain/entities/hierarchy';
import { chance } from '../../Chance/chance';
import { aList } from '../list.builder';

export const aHierarchy = (overrides?: Partial<HierarchyProps>) =>
    Hierarchy.create({
        id: chance.guid(),
        name: chance.name(),
        displayName: chance.name(),
        children: [],
        ...overrides,
    }).value();

export const aHierarchyList = (length?: number) => aList({ length, anItem: aHierarchy });
