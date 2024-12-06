import { GetUserRegisteredFoldersUseCaseFactoryService } from '../../../application/use-cases/get-user-registered-folders-use-case/get-user-registered-folders-use-case-factory.service';
import { AddProtectedFolderToUserUseCaseFactory } from '../../../application/use-cases/add-protected-folder-to-user/add-protected-folder-to-user-use-case.factory.service';
import { AddProtectedFolderToUserController } from './add-protected-folder-to-user/add-protected-folder-to-user.controller';
import { GetRegisterFoldersByUpnController } from './get-register-folders-by-upn/get-register-folders-by-upn.controller';
import { Module } from '@nestjs/common';

@Module({
    controllers: [GetRegisterFoldersByUpnController, AddProtectedFolderToUserController],
    providers: [GetUserRegisteredFoldersUseCaseFactoryService, AddProtectedFolderToUserUseCaseFactory],
})
export class EndpointModule {}
