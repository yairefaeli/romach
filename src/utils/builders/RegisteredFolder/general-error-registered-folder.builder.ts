import { RegisteredFolder, RegisteredFolderProps } from '../../../domain/entities/RegisteredFolder';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { chance } from '../../Chance/chance';
import { aList } from '../list.builder';

export const aGeneralErrorRegisteredFolder = (
    overrides?: Partial<
        Pick<
            RegisteredFolderProps,
            'upn' | 'folderId' | 'password' | 'isPasswordProtected' | 'lastValidPasswordTimestamp'
        >
    >,
) =>
    RegisteredFolder.createGeneralErrorRegisteredFolder({
        upn: 'test',
        folderId: chance.guid(),
        password: chance.string(),
        isPasswordProtected: chance.bool(),
        lastValidPasswordTimestamp: Timestamp.fromString(chance.date().toString()),
        ...overrides,
    }).value();

export const aGeneralErrorRegisteredFoldersList = (length?: number) =>
    aList({ length, anItem: aGeneralErrorRegisteredFolder });
