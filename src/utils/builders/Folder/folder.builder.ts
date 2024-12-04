import { Folder, FolderProps } from '../../../domain/entities/folder';
import { aBasicFolder } from '../BasicFolder/basic-folder.builder';
import { aPointsList } from '../Point/point.builder';
import { aAreasList } from '../Area/area.builder';
import { chance } from '../../Chance/chance';

export const aFolder = (overrides?: Partial<FolderProps>) =>
    Folder.create({
        type: 'folder',
        basicFolder: aBasicFolder(),
        entities: { areas: aAreasList(), points: aPointsList() },
        ...overrides,
    }).value();

export const aFoldersList = (length?: number) =>
    Array(length ?? chance.integer({ min: 1, max: 10 }))
        .fill(undefined)
        .map(aFolder);