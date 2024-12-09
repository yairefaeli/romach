import { HierarchyReplicationService } from '../../application/use-cases/hierarchy-replication/hierarchy-replication.service';
import { RomachEntitiesApiFactoryService } from '../romach-api/romach-entities-api/romach-entities-api-factory.service';
import { BasicFoldersRepositoryFactory } from '../romach-repository/basic-folders/basic-folders-repository-factory';
import { TreeCalculationService } from '../../domain/services/tree-calculation/tree-calculation.service';
import { HierarchyRepositoryFactory } from '../romach-repository/hierarchy/hierarchy-repository-factory';
import { LeaderElectionInterface } from '../../application/interfaces/leader-election.interface';
import { AppConfigService } from '../config/app-config/app-config.service';
import { RealityId } from '../../application/entities/reality-id';
import { AppLoggerService } from '../logging/app-logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HierarchyReplicationFactory {
    private perRealityMap: Map<string, HierarchyReplicationService>;

    constructor(
        private logger: AppLoggerService,
        private configService: AppConfigService,
        private treeCalculationService: TreeCalculationService,
        private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
        private hierarchyRepositoryFactoryService: HierarchyRepositoryFactory,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactory,
    ) {
        this.perRealityMap = new Map<string, HierarchyReplicationService>();
    }

    create(reality: RealityId, leaderElection: LeaderElectionInterface) {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
        const interval = this.configService.get().romach.basicFolder.pollInterval;
        const maxRetry = this.configService.get().romach.basicFolder.maxRetry;
        const basicFolderRepository = this.basicFoldersRepositoryFactoryService.create(reality);
        const hierarchyRepository = this.hierarchyRepositoryFactoryService.create(reality);
        const romachEntitiesApi = this.romachEntitiesApiFactoryService.create(reality);
        const treeCalculationService = new TreeCalculationService();

        const hierarchyReplicationService = new HierarchyReplicationService({
            reality,
            interval,
            maxRetry,
            leaderElection,
            romachEntitiesApi,
            logger: this.logger,
            treeCalculationService,
            hierarchyRepositoryInterface: hierarchyRepository,
            basicFolderRepositoryInterface: basicFolderRepository,
        });

        this.perRealityMap.set(reality, hierarchyReplicationService);
        return hierarchyReplicationService;
    }
}
