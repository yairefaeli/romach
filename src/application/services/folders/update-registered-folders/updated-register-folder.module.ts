import { RomachRepositoryModule } from '../../../../infra/romach-repository/repository.module';
import { RegisteredFoldersModule } from '../registered-folders/registered-folders.module';
import { RomachApiModule } from '../../../../infra/romach-api/romach-api.module';
import { UpdatedRegisterFolderFactory } from './updated-register-folder.factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [RegisteredFoldersModule, RomachApiModule, RomachRepositoryModule],
    providers: [UpdatedRegisterFolderFactory],
    exports: [UpdatedRegisterFolderFactory],
})
export class UpdatedRegisterFolderModule {}
