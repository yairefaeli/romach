import { LeaderElectionFactoryService } from '../leader-election/leader-election/postgres-based-leader-election-factory.service';
import { PostgresBasedLeaderElection } from '../leader-election/leader-election/postgres-based-leader-election';
import { RomachApiJwtIssuerService } from '../romach-api/romach-api-jwt-issuer/romach-api-jwt-issuer.service';
import { HierarchyReplicationServiceFactory } from './hierarchy-replication.service.factory';
import { RomachRepositoryModule } from '../romach-repository/romach-repository.module';
import { LeaderElectionModule } from '../leader-election/leader-election.module';
import { AppConfigService } from '../config/app-config/app-config.service';
import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RomachApiModule } from '../romach-api/romach-api.module';
import { AppLoggerService } from '../logging/app-logger.service';
import { forkJoin, Subscription } from 'rxjs';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Module({
    imports: [LeaderElectionModule, RomachApiModule, RomachRepositoryModule],
    providers: [HierarchyReplicationServiceFactory],
})
export class InitModule implements OnModuleInit, OnModuleDestroy {
    private hierarchyReplicationSubscription: Subscription;
    private replicationLeaderElection: PostgresBasedLeaderElection;

    constructor(
        private leaderElectionFactoryService: LeaderElectionFactoryService,
        private romachApiJwtIssuerService: RomachApiJwtIssuerService,
        private hierarchyReplicationFactoryService: HierarchyReplicationServiceFactory,
        private configService: AppConfigService,
        private logger: AppLoggerService,
        @InjectKnex() private readonly knex: Knex,
    ) {}

    async onModuleDestroy() {
        this.logger.info('Init module destroyed');
        if (this.replicationLeaderElection) {
            this.replicationLeaderElection.stop();
            this.logger.info('Leader election stopped');
        }
        this.romachApiJwtIssuerService.stop();
        if (this.hierarchyReplicationSubscription) {
            this.hierarchyReplicationSubscription.unsubscribe();
            this.logger.info('Hierarchy replication stopped');
        }
        await this.knex.destroy();
        this.logger.info('Knex connection destroyed');
    }

    async onModuleInit() {
        this.logger.info('Init module started');
        await this.startJwtTokenHandler();
        await this.startHierarchyReplication();
    }

    private async startJwtTokenHandler() {
        await this.romachApiJwtIssuerService.init();
    }

    private async startHierarchyReplication() {
        const realities = this.configService.get().romach.realities;
        this.logger.info('Starting hierarchy replication for realities', realities);

        this.replicationLeaderElection = await this.leaderElectionFactoryService.create({
            task: 'romach-replication-for-all-realities',
        });

        const replicationByRealityObservables = realities.map((reality) => {
            const hierarchyReplicationService = this.hierarchyReplicationFactoryService.create(
                reality,
                this.replicationLeaderElection,
            );
            return hierarchyReplicationService.execute();
        });

        this.hierarchyReplicationSubscription = forkJoin(replicationByRealityObservables).subscribe();
    }
}
