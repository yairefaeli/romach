import { UpdateBasicFoldersRepositoryModule } from '../update-basic-folder-repository/update-basic-folders-repository.module';
import { BasicFolderChangeDetectionModule } from '../basic-folder-change-detection/basic-folder-change-detection.module';
import { UpdatedRegisterFolderModule } from '../folders/update-registered-folders/updated-register-folder.module';
import { TreeCalculationHandlerModule } from '../tree-calculation-handler/tree-calculation-handler.module';
import { BasicFolderChangeHandlerFactory } from './basic-folder-change-handler.factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        UpdatedRegisterFolderModule,
        TreeCalculationHandlerModule,
        BasicFolderChangeDetectionModule,
        UpdateBasicFoldersRepositoryModule,
    ],
    providers: [BasicFolderChangeHandlerFactory],
    exports: [BasicFolderChangeHandlerFactory],
})
export class BasicFolderChangeHandlerModule {}
