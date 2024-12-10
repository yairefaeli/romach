import { BasicFoldersRepositoryFactory } from './basic-folders-repository-factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    providers: [BasicFoldersRepositoryFactory],
    exports: [BasicFoldersRepositoryFactory],
})
export class BasicFoldersRepositoryModule {}
