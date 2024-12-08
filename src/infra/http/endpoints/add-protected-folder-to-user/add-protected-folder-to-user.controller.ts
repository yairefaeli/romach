import { AddProtectedFolderToUserUseCaseService } from '../../../../application/use-cases/add-protected-folder-to-user/add-protected-folder-to-user.use-case.service';
import { BadRequestException, Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { isNil } from 'lodash';

@Controller('protected-folder')
export class AddProtectedFolderToUserController {
    constructor(private readonly addProtectedFolderToUserUseCaseService: AddProtectedFolderToUserUseCaseService) {}

    @Post('addProtectedFolder')
    async addProtectedFolderToUser(
        @Body() input: { folderId: string; upn: string; password: string },
    ): Promise<{ success: boolean }> {
        if (isNil(input?.folderId)) {
            throw new BadRequestException('folder ids is missing or not exist');
        }

        if (isNil(input?.upn)) {
            throw new BadRequestException('upn is missing or not exist');
        }

        try {
            await this.addProtectedFolderToUserUseCaseService.execute(input);

            return { success: true };
        } catch (error) {
            throw new HttpException(
                `Failed to add protected folder: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
