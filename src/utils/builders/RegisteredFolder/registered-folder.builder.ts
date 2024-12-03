import { RegisteredFolder, RegisteredFolderProps } from '../../../domain/entities/RegisteredFolder';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { aFolder } from '../Folder/folder.builder';
import { chance } from '../../Chance/chance';

export const aValidRegisteredFolder = (
    overrides?: Partial<Pick<RegisteredFolderProps, 'upn' | 'folder' | 'password' | 'lastValidPasswordTimestamp'>>,
) =>
    RegisteredFolder.createValidRegisteredFolder({
        upn: chance.upn(),
        folder: aFolder(),
        password: chance.string(),
        lastValidPasswordTimestamp: Timestamp.fromString(chance.date().toString()),
        ...overrides,
    }).value();

export const aValidRegisteredFoldersList = (length?: number) =>
    Array(length ?? chance.integer({ min: 1, max: 10 }))
        .fill(undefined)
        .map(aValidRegisteredFolder);

export const aGeneralErrorRegisteredFolder = (
    overrides?: Partial<
        Pick<
            RegisteredFolderProps,
            'upn' | 'folderId' | 'password' | 'isPasswordProtected' | 'lastValidPasswordTimestamp'
        >
    >,
) =>
    RegisteredFolder.createGeneralErrorRegisteredFolder({
        upn: chance.upn(),
        folderId: chance.guid(),
        password: chance.string(),
        isPasswordProtected: chance.bool(),
        lastValidPasswordTimestamp: Timestamp.fromString(chance.date().toString()),
        ...overrides,
    }).value();
