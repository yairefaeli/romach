import { RegisteredFoldersRepositoryModule } from '../../../../infra/romach-repository/registered-folders/registered-folders-repository.module';
import { RomachApiModule } from '../../../../infra/romach-api/romach-api.module';
import { RetryFailedStatusFactory } from './retry-failed-status.factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [RegisteredFoldersRepositoryModule, RomachApiModule],
    providers: [RetryFailedStatusFactory],
    exports: [RetryFailedStatusFactory],
})
export class RetryFailedStatusModule {}
