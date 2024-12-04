import { LeaderElectionModule } from './leader-election/leader-election.module';
import { RomachRepositoryModule } from './romach-repository/repository.module';
import { RomachApiModule } from './romach-api/romach-api.module';
import { DatabaseModule } from './database/database.module';
import { LoggingModule } from './logging/logging.module';
import { AppConfigModule } from './config/config.module';
import { HttpModule } from './http/http.module';
import { InitModule } from './init/init.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        AppConfigModule,
        LoggingModule,
        DatabaseModule,
        HttpModule,
        RomachApiModule,
        RomachRepositoryModule,
        LeaderElectionModule,
        InitModule,
    ],
    providers: [],
    exports: [],
})
export class InfraModule {}
