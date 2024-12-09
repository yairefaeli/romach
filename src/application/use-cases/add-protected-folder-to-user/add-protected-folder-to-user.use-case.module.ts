import { BasicFoldersRepositoryModule } from '../../../infra/romach-repository/basic-folders/basic-folders-repository.module';
import { RegisteredFoldersModule } from '../../services/folders/registered-folders/registered-folders.module';
import { AddProtectedFolderToUserUseCaseFactory } from './add-protected-folder-to-user-use-case.factory';
import { RomachApiModule } from '../../../infra/romach-api/romach-api.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [BasicFoldersRepositoryModule, RegisteredFoldersModule, RomachApiModule],
    providers: [AddProtectedFolderToUserUseCaseFactory],
    exports: [AddProtectedFolderToUserUseCaseFactory],
})
export class AddProtectedFolderToUserUseCaseModule {}
