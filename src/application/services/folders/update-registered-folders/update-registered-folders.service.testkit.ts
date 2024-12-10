import { UpdateRegisteredFoldersService } from './update-registered-folders.service';
import { Result } from 'rich-domain';

jest.mock('./update-registered-folders.service', () => ({
    UpdateRegisteredFoldersService: jest.fn().mockImplementation(() => ({
        handleBasicFoldersChange: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
    })),
}));

export const UpdateRegisteredFoldersServiceTestkit = () => {
    const updateRegisteredFoldersService = new UpdateRegisteredFoldersService(null);

    const mockHandleBasicFoldersChange = (
        value: Awaited<ReturnType<UpdateRegisteredFoldersService['handleBasicFoldersChange']>>,
    ) => (updateRegisteredFoldersService.handleBasicFoldersChange = jest.fn().mockReturnValue(Promise.resolve(value)));

    return { mockHandleBasicFoldersChange, updateRegisteredFoldersService: () => updateRegisteredFoldersService };
};
