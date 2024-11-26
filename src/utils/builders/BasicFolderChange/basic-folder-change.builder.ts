import { BasicFolderChange } from '../../../application/interfaces/basic-folder-changes.interface';
import { aBasicFolder } from '../BasicFolder/basic-folder.builder';
import { chance } from '../../Chance/chance';

export const aBasicFolderChange = (overrides?: Partial<BasicFolderChange>): BasicFolderChange => ({
    inserted: Array(chance.integer({ min: 1, max: 10 }))
        .fill(undefined)
        .map(aBasicFolder),
    deleted: Array(chance.integer({ min: 1, max: 10 }))
        .fill(undefined)
        .map(() => chance.guid()),
    updated: Array(chance.integer({ min: 1, max: 10 }))
        .fill(undefined)
        .map(aBasicFolder),
    ...overrides,
});
