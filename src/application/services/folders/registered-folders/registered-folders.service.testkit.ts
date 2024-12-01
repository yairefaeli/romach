jest.mock('./registered-folders.service', () => ({
    RegisteredFoldersService: jest.fn().mockImplementation(() => ({})),
}));

export const RegisteredFoldersServiceTestkit = () => {};
