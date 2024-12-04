import { RomachRepositoryFactoryService } from './repository-factory/romach-repository-factory.service';
import { BasicFoldersFactoryService } from './repository-factory/basic-folders-factory.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [RomachRepositoryFactoryService, BasicFoldersFactoryService],
    exports: [RomachRepositoryFactoryService, BasicFoldersFactoryService],
})
export class RomachRepositoryModule {}
