import { BasicFolder, BasicFolderProps } from '../../../domain/entities/BasicFolder';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { chance } from '../../Chance/chance';

export const aBasicFolder = (overrides?: Partial<BasicFolderProps>) =>
    BasicFolder.create({
        id: chance.guid(),
        name: chance.name(),
        isLocal: chance.bool(),
        deleted: chance.bool(),
        categoryId: chance.guid(),
        isPasswordProtected: chance.bool(),
        creationDate: chance.date().toString(),
        updatedAt: Timestamp.fromString(chance.date().toString()),
        ...overrides,
    }).value();

export const aBasicFoldersList = (length?: number) =>
    Array(length ?? chance.integer({ min: 1, max: 50 }))
        .fill(undefined)
        .map(aBasicFolder);
