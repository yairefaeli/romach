import { GetUserRegisteredFoldersUseCaseService } from '../../../../application/use-cases/get-user-registered-folders-use-case/get-user-registered-folders-use-case.service';
import { BadRequestException, Controller, Get, Headers, Query } from '@nestjs/common';

@Controller('protected-folder')
export class GetRegisterFoldersByUpnController {
    constructor(private readonly getUserRegisteredFoldersUseCaseService: GetUserRegisteredFoldersUseCaseService) {}

    @Get('registered-folders')
    async getRegisteredFoldersByUpn(
        @Query('upn') upn: string,
        @Headers('realityId') realityId: string,
    ): Promise<{ ids: string[] }> {
        if (!upn) {
            throw new BadRequestException('Query parameter "upn" is required.');
        }
        if (!realityId) {
            throw new BadRequestException('Header "realityId" is required.');
        }

        const result = await this.getUserRegisteredFoldersUseCaseService.execute({ upn });

        if (result.isFail()) {
            throw new BadRequestException(result.error());
        }

        return result.value();
    }
}
