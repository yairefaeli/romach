import { UpdateRegisteredFoldersService } from './update-registered-folders.service';
import { Result } from 'rich-domain';

jest.mock('./update-registered-folders.service', () => ({
    UpdateRegisteredFoldersService: jest.fn().mockImplementation(() => ({
        basicFolderUpdated: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
    })),
}));

export const UpdateRegisteredFoldersServiceTestkit = () => {
    const updateRegisteredFoldersService = new UpdateRegisteredFoldersService(null);

    const mockBasicFolderUpdated = (value: Awaited<ReturnType<UpdateRegisteredFoldersService['basicFolderUpdated']>>) =>
        (updateRegisteredFoldersService.basicFolderUpdated = jest.fn().mockReturnValue(Promise.resolve(value)));

    return { mockBasicFolderUpdated, updateRegisteredFoldersService: () => updateRegisteredFoldersService };
};
