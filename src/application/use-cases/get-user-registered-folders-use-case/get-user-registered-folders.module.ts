import { GetUserRegisteredFoldersUseCaseService } from './get-user-registered-folders-use-case.service';
import { RomachRepositoryModule } from '../../../infra/romach-repository/romach-repository.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [RomachRepositoryModule],
    providers: [GetUserRegisteredFoldersUseCaseService],
    exports: [GetUserRegisteredFoldersUseCaseService],
})
export class GetUserRegisteredFoldersModule {}
