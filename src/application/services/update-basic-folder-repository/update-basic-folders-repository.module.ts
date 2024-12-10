import { UpdateBasicFoldersRepositoryFactory } from './update-basic-folders-repository.factory';
import { RomachRepositoryModule } from '../../../infra/romach-repository/repository.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [RomachRepositoryModule],
    providers: [UpdateBasicFoldersRepositoryFactory],
    exports: [UpdateBasicFoldersRepositoryFactory],
})
export class UpdateBasicFoldersRepositoryModule {}
