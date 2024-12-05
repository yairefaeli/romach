import { UpdateBasicFoldersRepositoryService } from './update-basic-folders-repository.service';
import { Result } from 'rich-domain';

jest.mock('./update-basic-folders-repository.service', () => ({
    UpdateBasicFoldersRepositoryService: jest.fn().mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(Result.Ok()),
    })),
}));

export const UpdateBasicFolderRepositoryServiceTestkit = () => {
    const basicFolderChangeDetectionService = new UpdateBasicFoldersRepositoryService(null);

    const mockExecute = (value: Awaited<ReturnType<UpdateBasicFoldersRepositoryService['execute']>>) =>
        (basicFolderChangeDetectionService.execute = jest.fn().mockResolvedValue(value));

    return { mockExecute, basicFolderChangeDetectionService: () => basicFolderChangeDetectionService };
};
