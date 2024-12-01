import { UpdateBasicFoldersRepositoryService } from './update-basic-folder-repository.service';

jest.mock('./update-basic-folder-repository.service', () => ({
    UpdateBasicFoldersRepositoryService: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

export const UpdateBasicFolderRepositoryServiceTestkit = () => {
    const basicFolderChangeDetectionService = new UpdateBasicFoldersRepositoryService(null);

    const mockExecute = (value: ReturnType<UpdateBasicFoldersRepositoryService['execute']>) =>
        (basicFolderChangeDetectionService.execute = jest.fn().mockReturnValue(value));

    return { mockExecute, basicFolderChangeDetectionService: () => basicFolderChangeDetectionService };
};
