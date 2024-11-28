import { UpdateBasicFoldersRepositoryService } from './update-basic-folder-repository.service';

jest.mock('./update-basic-folder-repository.service', () => ({
    UpdateBasicFoldersRepositoryService: jest.fn().mockImplementation(() => ({
        execute: jest.fn(),
    })),
}));

export const UpdateBasicFolderRepositoryServiceTestkit = () => {
    const basicFolderChangeDetectionService = new UpdateBasicFoldersRepositoryService(null);

    return { basicFolderChangeDetectionService: () => basicFolderChangeDetectionService };
};
