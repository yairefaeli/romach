import { RegisteredFoldersRepositoryFactory } from './regsiterd-folders-repository-factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    providers: [RegisteredFoldersRepositoryFactory],
    exports: [RegisteredFoldersRepositoryFactory],
})
export class RegisteredFoldersRepositoryModule {}
