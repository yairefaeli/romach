import { GetUserRegisteredFoldersUseCaseFactoryService } from '../../../../application/use-cases/get-user-registered-folders-use-case/get-user-registered-folders-use-case-factory.service';
import { GetRegisterFoldersByUpnService } from './get-register-folders-by-upn.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Result } from 'rich-domain';

describe('GetRegsiterFoldersByUpnService', () => {
    let controller: GetRegisterFoldersByUpnService;

    beforeEach(async () => {
        const mockUseCaseFactory = {
            create: jest.fn().mockReturnValue({
                execute: jest.fn().mockResolvedValue(Result.Ok({ ids: ['folder-123', 'folder-456', 'folder-789'] })),
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GetRegisterFoldersByUpnService],
            providers: [
                {
                    provide: GetUserRegisteredFoldersUseCaseFactoryService,
                    useValue: mockUseCaseFactory,
                },
            ],
        }).compile();

        controller = module.get<GetRegisterFoldersByUpnService, any>(GetRegisterFoldersByUpnService);
    });

    it('should return folder IDs when valid upn and realityId are provided', async () => {
        const result = await controller.getRegisteredFoldersByUpn('user@example.com', '0');
        expect(result).toEqual({ ids: ['folder-123', 'folder-456', 'folder-789'] });
    });

    it('should throw a 400 error if upn is missing', async () => {
        await expect(controller.getRegisteredFoldersByUpn('', 'reality-123')).rejects.toThrow(
            'Query parameter "upn" is required.',
        );
    });

    it('should throw a 400 error if realityId is missing', async () => {
        await expect(controller.getRegisteredFoldersByUpn('user@example.com', '')).rejects.toThrow(
            'Header "realityId" is required.',
        );
    });
});
