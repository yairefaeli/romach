import { RegisteredFoldersRepositoryModule } from '../../../infra/romach-repository/registered-folders/registered-folders-repository.module';
import { GetUserRegisteredFoldersUseCaseFactory } from './get-user-registered-folders-use-case-factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [RegisteredFoldersRepositoryModule],
    providers: [GetUserRegisteredFoldersUseCaseFactory],
    exports: [GetUserRegisteredFoldersUseCaseFactory],
})
export class GetUserRegisteredFoldersUseCaseModule {}
