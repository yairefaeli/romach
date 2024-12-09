import { AddProtectedFolderToUserUseCaseFactory } from '../../../../application/use-cases/add-protected-folder-to-user/add-protected-folder-to-user-use-case.factory';
import { AddProtectedFolderToUserController } from './add-protected-folder-to-user.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Result } from 'rich-domain';

describe('AddProtectedFolderToUserController', () => {
    let controller: AddProtectedFolderToUserController;
    let useCaseFactory: AddProtectedFolderToUserUseCaseFactory;

    beforeEach(async () => {
        const mockUseCaseFactory = {
            create: jest.fn().mockReturnValue({
                execute: jest.fn().mockResolvedValue(Result.Ok()),
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AddProtectedFolderToUserController],
            providers: [
                {
                    provide: AddProtectedFolderToUserUseCaseFactory,
                    useValue: mockUseCaseFactory,
                },
            ],
        }).compile();

        controller = module.get<AddProtectedFolderToUserController, any>(AddProtectedFolderToUserController);
        useCaseFactory = module.get<AddProtectedFolderToUserUseCaseFactory, any>(
            AddProtectedFolderToUserUseCaseFactory,
        );
    });

    describe('addProtectedFolderToUser', () => {
        it('should return success when valid input is provided', async () => {
            const input = { folderId: 'folder-123', upn: 'user@example.com', password: 'Aa123456' };
            const realityId = '0';

            const result = await controller.addProtectedFolderToUser(input, realityId);

            expect(result).toEqual({ success: true });
            expect(useCaseFactory.create).toHaveBeenCalledWith(realityId);
            expect(useCaseFactory.create(realityId).execute).toHaveBeenCalledWith(input);
        });

        it('should throw BadRequestException if folderId is missing', async () => {
            const input = { folderId: null, upn: 'user@example.com', password: 'Aa123456' };
            const realityId = '0';

            await expect(controller.addProtectedFolderToUser(input, realityId)).rejects.toThrow(
                new BadRequestException('folder ids is missing or not exist'),
            );
        });

        it('should throw BadRequestException if upn is missing', async () => {
            const input = { folderId: 'folder-123', upn: null, password: 'Aa123456' };
            const realityId = '0';

            await expect(controller.addProtectedFolderToUser(input, realityId)).rejects.toThrow(
                new BadRequestException('upn is missing or not exist'),
            );
        });
    });
});
