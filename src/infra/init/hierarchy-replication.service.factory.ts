import { BasicFoldersRepositoryFactoryService } from '../romach-repository/repository-factory/basic-folders-repository-factory.service';
import { HierarchyRepositoryFactoryService } from '../romach-repository/repository-factory/hierarchy-repository-factory.service';
import { HierarchyReplicationService } from '../../application/use-cases/hierarchy-replication/hierarchy-replication.service';
import { RomachEntitiesApiFactoryService } from '../romach-api/romach-entities-api/romach-entities-api-factory.service';
import { TreeCalculationService } from '../../domain/services/tree-calculation/tree-calculation.service';
import { LeaderElectionInterface } from '../../application/interfaces/leader-election.interface';
import { AppConfigService } from '../config/app-config/app-config.service';
import { RealityId } from '../../application/entities/reality-id';
import { AppLoggerService } from '../logging/app-logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HierarchyReplicationServiceFactory {
    private perRealityMap: Map<string, HierarchyReplicationService>;

    constructor(
        private logger: AppLoggerService,
        private configService: AppConfigService,
        private treeCalculationService: TreeCalculationService,
        private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
        private hierarchyRepositoryFactoryService: HierarchyRepositoryFactoryService,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactoryService,
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
