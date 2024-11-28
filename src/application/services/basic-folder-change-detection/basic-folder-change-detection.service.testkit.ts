import { BasicFolderChangeDetectionService } from './basic-folder-change-detection.service';

jest.mock('./basic-folder-change-detection.service', () => ({
    BasicFolderChangeDetectionService: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

export const BasicFolderChangeDetectionServiceTestkit = () => {
    const basicFolderChangeDetectionService = new BasicFolderChangeDetectionService(null);

    const mockExecute = (value: ReturnType<BasicFolderChangeDetectionService['execute']>) =>
        (basicFolderChangeDetectionService.execute = jest.fn().mockReturnValue(Promise.resolve(value)));

    return { mockExecute, basicFolderChangeDetectionService: () => basicFolderChangeDetectionService };
};
