import { chance } from '../Chance/chance';

interface ListBuilderProps<T> {
    length?: number;
    anItem: () => T;
}

export const aList = <T>(props: ListBuilderProps<T>) =>
    Array(props.length ?? chance.integer({ min: 1, max: 10 }))
        .fill(undefined)
        .map(() => props.anItem());
