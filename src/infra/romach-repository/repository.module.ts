import { RegisteredFoldersServiceFactory } from '../../application/services/folders/registered-folders/registered-folders.service.factory';
import { BasicFoldersRepositoryFactoryService } from './repository-factory/basic-folders-repository-factory.service';
import { HierarchyRepositoryFactoryService } from './repository-factory/hierarchy-repository-factory.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [
        HierarchyRepositoryFactoryService,
        BasicFoldersRepositoryFactoryService,
        RegisteredFoldersServiceFactory,
    ],
    exports: [HierarchyRepositoryFactoryService, BasicFoldersRepositoryFactoryService, RegisteredFoldersServiceFactory],
})
export class RomachRepositoryModule {}
