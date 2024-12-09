import { RegisteredFoldersRepositoryModule } from '../../../../infra/romach-repository/registered-folders/registered-folders-repository.module';
import { RegisteredFoldersFactory } from './registered-folders.factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [RegisteredFoldersRepositoryModule],
    providers: [RegisteredFoldersFactory],
    exports: [RegisteredFoldersFactory],
})
export class RegisteredFoldersModule {}
