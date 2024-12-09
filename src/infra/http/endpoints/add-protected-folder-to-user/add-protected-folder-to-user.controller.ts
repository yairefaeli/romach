import { AddProtectedFolderToUserUseCaseFactory } from '../../../../application/use-cases/add-protected-folder-to-user/add-protected-folder-to-user-use-case.factory';
import { BadRequestException, Body, Controller, Headers, HttpException, HttpStatus, Post } from '@nestjs/common';
import { isNil } from 'lodash';

@Controller('protected-folder')
export class AddProtectedFolderToUserController {
    constructor(private readonly addProtectedFolderToUserUseCaseFactory: AddProtectedFolderToUserUseCaseFactory) {}

    @Post('addProtectedFolder')
    async addProtectedFolderToUser(
        @Body() input: { folderId: string; upn: string; password: string },
        @Headers('realityId') realityId: string,
    ): Promise<{ success: boolean }> {
        if (isNil(input?.folderId)) {
            throw new BadRequestException('folder ids is missing or not exist');
        }

        if (isNil(input?.upn)) {
            throw new BadRequestException('upn is missing or not exist');
        }

        const service = this.addProtectedFolderToUserUseCaseFactory.create(realityId);

        try {
            await service.execute(input);
            return { success: true };
        } catch (error) {
            throw new HttpException(
                `Failed to add protected folder: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
