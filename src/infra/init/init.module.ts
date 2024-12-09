import { BasicFolderChangeHandlerModule } from '../../application/services/basic-folder-change-handler/basic-folder-change-handler.module';
import { BasicFolderReplicationFactory } from '../../application/use-cases/basic-folder-replication/basic-folder-replication.factory';
import { BasicFolderReplicationModule } from '../../application/use-cases/basic-folder-replication/basic-folder-replication.module';
import { RegisteredFoldersRepositoryFactory } from '../romach-repository/registered-folders/regsiterd-folders-repository-factory';
import { LeaderElectionFactoryService } from '../leader-election/leader-election/postgres-based-leader-election-factory.service';
import { RetryFailedStatusFactory } from '../../application/services/folders/retry-failed-status/retry-failed-status.factory';
import { RetryFailedStatusModule } from '../../application/services/folders/retry-failed-status/retry-failed-status.module';
import { GarbageCollectorFactory } from '../../application/services/folders/garbage-collector/garbage-collector.factory';
import { GarbageCollectorModule } from '../../application/services/folders/garbage-collector/garbage-collector.module';
import { BasicFoldersRepositoryModule } from '../romach-repository/basic-folders/basic-folders-repository.module';
import { PostgresBasedLeaderElection } from '../leader-election/leader-election/postgres-based-leader-election';
import { TreeCalculationModule } from '../../domain/services/tree-calculation/tree-calculation.module';
import { HierarchyRepositoryModule } from '../romach-repository/hierarchy/hierarchy-repository.module';
import { LeaderElectionModule } from '../leader-election/leader-election.module';
import { HierarchyReplicationFactory } from './hierarchy-replication.factory';
import { AppConfigService } from '../config/app-config/app-config.service';
import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RomachApiModule } from '../romach-api/romach-api.module';
import { AppLoggerService } from '../logging/app-logger.service';
import { forkJoin, Subscription } from 'rxjs';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Module({
    imports: [
        LeaderElectionModule,
        RomachApiModule,
        HierarchyRepositoryModule,
        TreeCalculationModule,
        BasicFoldersRepositoryModule,
        BasicFolderChangeHandlerModule,
        BasicFolderReplicationModule,
        GarbageCollectorModule,
        RetryFailedStatusModule,
    ],
    providers: [
        HierarchyReplicationFactory,
        BasicFolderReplicationFactory,
        GarbageCollectorFactory,
        RegisteredFoldersRepositoryFactory,
        RetryFailedStatusFactory,
    ],
})
export class InitModule implements OnModuleInit, OnModuleDestroy {
    private subscriptions: Subscription[] = [];
    private replicationLeaderElection: PostgresBasedLeaderElection;

    constructor(
        private logger: AppLoggerService,
        private configService: AppConfigService,
        private hierarchyReplicationFactory: HierarchyReplicationFactory,
        private basicFolderReplicationFactory: BasicFolderReplicationFactory,
        private garbageCollectorFactory: GarbageCollectorFactory,
        private retryFailedStatusFactory: RetryFailedStatusFactory,
        private leaderElectionFactoryService: LeaderElectionFactoryService,
        @InjectKnex() private readonly knex: Knex,
    ) {}

    async onModuleInit() {
        this.logger.info('Init module started');
        const realities = this.configService.get().romach.realities;

        await this.initializeHierarchyReplication(realities);
        await this.initializeBasicFolderReplication(realities);
        await this.initializeGarbageCollector(realities);
        await this.initializeRetryFailedStatus(realities);
    }

    private async initializeHierarchyReplication(realities: string[]) {
        this.logger.info('Initializing Hierarchy Replication');
        this.replicationLeaderElection = await this.leaderElectionFactoryService.create({
            task: 'romach-replication-for-all-realities',
        });

        const observables = realities.map((reality) => {
            const service = this.hierarchyReplicationFactory.create(reality, this.replicationLeaderElection);
            return service.execute();
        });

        this.subscriptions.push(
            forkJoin(observables).subscribe({
                next: () => this.logger.info('Hierarchy Replication completed'),
                error: (err) => this.logger.error('Hierarchy Replication failed', err),
            }),
        );
    }

    private async initializeBasicFolderReplication(realities: string[]) {
        this.logger.info('Initializing Basic Folder Replication');
        this.replicationLeaderElection = await this.leaderElectionFactoryService.create({
            task: 'basic-folder-replication-for-all-realities',
        });
        const observables = realities.map((reality) => {
            const service = this.basicFolderReplicationFactory.create(reality, this.replicationLeaderElection);
            return service.execute();
        });

        this.subscriptions.push(
            forkJoin(observables).subscribe({
                next: () => this.logger.info('Basic Folder Replication completed'),
                error: (err) => this.logger.error('Basic Folder Replication failed', err),
            }),
        );
    }

    private async initializeGarbageCollector(realities: string[]) {
        this.logger.info('Initializing Garbage Collector');

        this.replicationLeaderElection = await this.leaderElectionFactoryService.create({
            task: 'garbage-collector-for-all-realities',
        });

        realities
            .map((reality) => this.garbageCollectorFactory.create(reality))
            .forEach((garbageCollector) => garbageCollector.execute());
    }

    private async initializeRetryFailedStatus(realities: string[]) {
        this.logger.info('Initializing Retry Failed Status');
        this.replicationLeaderElection = await this.leaderElectionFactoryService.create({
            task: 'retry-failed-for-all-realities',
        });

        realities
            .map((reality) => this.retryFailedStatusFactory.create(reality))
            .forEach((retryFailedStatus) => retryFailedStatus.retryFailedStatus());
    }

    async onModuleDestroy() {
        this.logger.info('Init module destroyed');

        // Stop leader election if running
        if (this.replicationLeaderElection) {
            this.replicationLeaderElection.stop();
            this.logger.info('Leader election stopped');
        }

        // Unsubscribe all subscriptions
        this.subscriptions.forEach((sub) => sub.unsubscribe());

        // Destroy Knex connection
        await this.knex.destroy();
        this.logger.info('Knex connection destroyed');
    }
}
