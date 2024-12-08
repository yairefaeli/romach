import { GetUserRegisteredFoldersModule } from '../../../application/use-cases/get-user-registered-folders-use-case/get-user-registered-folders.module';
import { AddProtectedFolderToUserController } from './add-protected-folder-to-user/add-protected-folder-to-user.controller';
import { GetRegisterFoldersByUpnController } from './get-register-folders-by-upn/get-register-folders-by-upn.controller';
import { Module } from '@nestjs/common';

@Module({
    imports: [GetUserRegisteredFoldersModule],
    controllers: [GetRegisterFoldersByUpnController, AddProtectedFolderToUserController],
})
export class EndpointModule {}
