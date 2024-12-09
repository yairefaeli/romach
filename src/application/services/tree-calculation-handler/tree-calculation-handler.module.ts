import { BasicFoldersRepositoryModule } from '../../../infra/romach-repository/basic-folders/basic-folders-repository.module';
import { HierarchyRepositoryModule } from '../../../infra/romach-repository/hierarchy/hierarchy-repository.module';
import { TreeCalculationHandlerFactory } from './tree-calculation-handler.factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [HierarchyRepositoryModule, BasicFoldersRepositoryModule],
    providers: [TreeCalculationHandlerFactory],
    exports: [TreeCalculationHandlerFactory],
})
export class TreeCalculationHandlerModule {}
