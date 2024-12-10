import { FoldersIdsAndsUpdatedAt } from '../../../application/view-model/folders-by-ids-response';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { chance } from '../../Chance/chance';
import { aList } from '../list.builder';

export const anIdAndUpdatedAt = (overrides?: Partial<FoldersIdsAndsUpdatedAt>): FoldersIdsAndsUpdatedAt => ({
    id: chance.guid(),

    updatedAt: Timestamp.fromString(chance.date().toString()),
    ...overrides,
});

export const aIdsAndUpdatedAtList = (length?: number) => aList({ length, anItem: anIdAndUpdatedAt });
