import { RegisteredFoldersRepositoryFactory } from './registered-folders/regsiterd-folders-repository-factory';
import { BasicFoldersRepositoryFactory } from './basic-folders/basic-folders-repository-factory';
import { HierarchyRepositoryFactory } from './hierarchy/hierarchy-repository-factory';
import { Module } from '@nestjs/common';

@Module({
    providers: [RegisteredFoldersRepositoryFactory, HierarchyRepositoryFactory, BasicFoldersRepositoryFactory],
    exports: [RegisteredFoldersRepositoryFactory, HierarchyRepositoryFactory, BasicFoldersRepositoryFactory],
})
export class RomachRepositoryModule {}
