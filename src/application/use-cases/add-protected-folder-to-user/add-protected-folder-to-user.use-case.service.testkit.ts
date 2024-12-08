import { AddProtectedFolderToUserUseCase } from './add-protected-folder-to-user.use-case.service';
import { Result } from 'rich-domain';

jest.mock('./add-protected-folder-to-user.use-case.service', () => ({
    AddProtectedFolderToUserUseCase: jest.fn().mockImplementation(() => ({
        execute: jest.fn().mockReturnValue(Promise.resolve(Result.Ok())),
    })),
}));

export const AddProtectedFolderToUserUseCaseTestkit = () => {
    const addProtectedFolderToUserUseCase = new AddProtectedFolderToUserUseCase(null);

    const mockExecute = (value: Awaited<ReturnType<AddProtectedFolderToUserUseCase['execute']>>) =>
        (addProtectedFolderToUserUseCase.execute = jest.fn().mockReturnValue(value));

    return { mockExecute, addProtectedFolderToUserUseCase: () => addProtectedFolderToUserUseCase };
};
