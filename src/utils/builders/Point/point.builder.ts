import { Point, PointProps } from '../../../domain/entities/Point';
import { chance } from '../../Chance/chance';
import { aList } from '../list.builder';

export const aPoint = (overrides?: Partial<PointProps>) =>
    Point.create({
        id: chance.guid(),
        name: chance.name(),
        other: chance.string(),
        ...overrides,
    }).value();

export const aPointsList = (length?: number) => aList({ length, anItem: aPoint });
