import { UpdateBasicFoldersRepositoryService } from './update-basic-folders-repository.service';
import { Result } from 'rich-domain';

jest.mock('./update-basic-folders-repository.service', () => ({
    UpdateBasicFoldersRepositoryService: jest.fn().mockImplementation(() => ({
        execute: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
    })),
}));

export const UpdateBasicFolderRepositoryServiceTestkit = () => {
    const basicFolderChangeDetectionService = new UpdateBasicFoldersRepositoryService(null);

    const mockExecute = (value: Awaited<ReturnType<UpdateBasicFoldersRepositoryService['execute']>>) =>
        (basicFolderChangeDetectionService.execute = jest.fn().mockReturnValue(Promise.resolve(value)));

    return { mockExecute, basicFolderChangeDetectionService: () => basicFolderChangeDetectionService };
};
