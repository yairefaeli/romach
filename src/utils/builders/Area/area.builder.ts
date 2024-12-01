import { Area, AreaProps } from '../../../domain/entities/Area';
import { chance } from '../../Chance/chance';

export const anArea = (overrides?: Partial<AreaProps>) =>
    Area.create({
        id: chance.guid(),
        name: chance.name(),
        other: chance.string(),
        ...overrides,
    }).value();

export const aAreasList = (length?: number) =>
    Array(length ?? chance.integer({ min: 1, max: 10 }))
        .fill(undefined)
        .map(anArea);
