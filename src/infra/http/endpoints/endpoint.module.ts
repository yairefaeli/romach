import { GetUserRegisteredFoldersUseCaseModule } from '../../../application/use-cases/get-user-registered-folders-use-case/get-user-registered-folders-use-case-module';
import { AddProtectedFolderToUserUseCaseModule } from '../../../application/use-cases/add-protected-folder-to-user/add-protected-folder-to-user.use-case.module';
import { AddProtectedFolderToUserController } from './add-protected-folder-to-user/add-protected-folder-to-user.controller';
import { GetRegisterFoldersByUpnController } from './get-register-folders-by-upn/get-register-folders-by-upn.controller';
import { Module } from '@nestjs/common';

@Module({
    imports: [GetUserRegisteredFoldersUseCaseModule, AddProtectedFolderToUserUseCaseModule],
    controllers: [GetRegisterFoldersByUpnController, AddProtectedFolderToUserController],
    providers: [],
})
export class EndpointModule {}
