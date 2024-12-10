import { BasicFolderChangeHandlerModule } from '../../services/basic-folder-change-handler/basic-folder-change-handler.module';
import { RomachRepositoryModule } from '../../../infra/romach-repository/repository.module';
import { BasicFolderReplicationFactory } from './basic-folder-replication.factory';
import { RomachApiModule } from '../../../infra/romach-api/romach-api.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [RomachApiModule, RomachRepositoryModule, BasicFolderChangeHandlerModule],
    providers: [
        BasicFolderReplicationFactory,
        { provide: 'POLL_INTERVAL', useValue: 5000 },
        { provide: 'RETRY_INTERVAL', useValue: 10000 },
        { provide: 'MAX_RETRY', useValue: 5 },
    ],
    exports: [
        BasicFolderReplicationFactory,
        { provide: 'POLL_INTERVAL', useValue: 5000 },
        { provide: 'RETRY_INTERVAL', useValue: 10000 },
        { provide: 'MAX_RETRY', useValue: 5 },
    ],
})
export class BasicFolderReplicationModule {}
