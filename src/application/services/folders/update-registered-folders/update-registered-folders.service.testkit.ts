import { UpdateRegisteredFoldersService } from './update-registerd-folders.service';

jest.mock('./update-registered-folders.service', () => ({
    UpdateRegisteredFolders: () =>
        jest.fn().mockImplementation(() => ({
            basicFolderUpdated: jest.fn(),
        })),
}));

export const UpdateRegisteredFoldersServiceTestkit = () => {
    const updateRegisteredFoldersService = new UpdateRegisteredFoldersService(null);

    return { updateRegisteredFoldersService: () => updateRegisteredFoldersService };
};
