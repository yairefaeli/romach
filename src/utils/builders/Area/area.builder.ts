import { Area, AreaProps } from '../../../domain/entities/Area';
import { chance } from '../../Chance/chance';
import { aList } from '../list.builder';

export const anArea = (overrides?: Partial<AreaProps>) =>
    Area.create({
        id: chance.guid(),
        name: chance.name(),
        other: chance.string(),
        ...overrides,
    }).value();

export const aAreasList = (length?: number) => aList({ length, anItem: anArea });
