import { LeaderElectionFactoryService } from './leader-election/postgres-based-leader-election-factory.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [LeaderElectionFactoryService],
    exports: [LeaderElectionFactoryService],
})
export class LeaderElectionModule {}
