import { aBasicFolderChange } from '../../../utils/builders/BasicFolderChange/basic-folder-change.builder';
import { BasicFolderChangeDetectionService } from './basic-folder-change-detection.service';
import { Result } from 'rich-domain';

jest.mock('./basic-folder-change-detection.service', () => ({
    BasicFolderChangeDetectionService: jest.fn().mockImplementation(() => ({
        execute: jest.fn().mockReturnValue(Promise.resolve(Result.Ok(aBasicFolderChange()))),
    })),
}));

export const BasicFolderChangeDetectionServiceTestkit = () => {
    const basicFolderChangeDetectionService = new BasicFolderChangeDetectionService(null);

    const mockExecute = (value: Awaited<ReturnType<BasicFolderChangeDetectionService['execute']>>) =>
        (basicFolderChangeDetectionService.execute = jest.fn().mockReturnValue(value));

    return { mockExecute, basicFolderChangeDetectionService: () => basicFolderChangeDetectionService };
};
