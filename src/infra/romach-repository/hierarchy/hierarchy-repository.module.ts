import { HierarchyRepositoryFactory } from './hierarchy-repository-factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    providers: [HierarchyRepositoryFactory],
    exports: [HierarchyRepositoryFactory],
})
export class HierarchyRepositoryModule {}
