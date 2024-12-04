import { GetUserRegisteredFoldersUseCaseFactoryService } from '../../../application/use-cases/get-user-registered-folders-use-case/get-user-registered-folders-use-case-factory.service';
import { AddProtectedFolderToUserController } from './add-protected-folder-to-user/add-protected-folder-to-user.service';
import { GetRegisterFoldersByUpnService } from './get-register-folders-by-upn/get-register-folders-by-upn.service';
import { Module } from '@nestjs/common';

@Module({
    controllers: [GetRegisterFoldersByUpnService, AddProtectedFolderToUserController],
    providers: [GetUserRegisteredFoldersUseCaseFactoryService, GetUserRegisteredFoldersUseCaseFactoryService],
})
export class EndpointModule {}
