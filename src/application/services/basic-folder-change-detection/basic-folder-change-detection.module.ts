import { RomachRepositoryModule } from '../../../infra/romach-repository/repository.module';
import { BasicFolderChangeDetectionFactory } from './basic-folder-change-detection.factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [RomachRepositoryModule],
    providers: [BasicFolderChangeDetectionFactory],
    exports: [BasicFolderChangeDetectionFactory],
})
export class BasicFolderChangeDetectionModule {}
