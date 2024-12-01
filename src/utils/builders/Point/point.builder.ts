import { Point, PointProps } from '../../../domain/entities/Point';
import { chance } from '../../Chance/chance';

export const aPoint = (overrides?: Partial<PointProps>) =>
    Point.create({
        id: chance.guid(),
        name: chance.name(),
        other: chance.string(),
        ...overrides,
    }).value();

export const aPointsList = (length?: number) =>
    Array(length ?? chance.integer({ min: 1, max: 10 }))
        .fill(undefined)
        .map(aPoint);
