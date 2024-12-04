import { RegisteredFolder, RegisteredFolderProps } from '../../../domain/entities/RegisteredFolder';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { aFolder } from '../Folder/folder.builder';
import { chance } from '../../Chance/chance';
import { aList } from '../list.builder';

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

export const aValidRegisteredFoldersList = (length?: number) => aList({ length, anItem: aValidRegisteredFolder });
