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
