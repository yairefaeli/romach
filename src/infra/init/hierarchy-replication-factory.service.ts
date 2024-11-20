import { HierarchyReplicationService } from '../../application/use-cases/hierarchy-replication/hierarchy-replication.service';
import { RomachRepositoryFactoryService } from '../romach-repository/romach-repository-factory.service';
import { RomachEntitiesApiFactoryService } from '../romach-api/romach-entities-api/romach-entities-api-factory.service';
import { LeaderElectionInterface } from '../../application/interfaces/leader-election.interface';
import { AppConfigService } from '../config/app-config/app-config.service';
import { RealityId } from '../../application/entities/reality-id';
import { AppLoggerService } from '../logging/app-logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HierarchyReplicationFactoryService {
  private perRealityMap: Map<string, HierarchyReplicationService>;

  constructor(
    private romachRepositoryFactoryService: RomachRepositoryFactoryService,
    private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
    private configService: AppConfigService,
    private logger: AppLoggerService,
  ) {
    this.perRealityMap = new Map<string, HierarchyReplicationService>();
  }

  create(reality: RealityId, leaderElection: LeaderElectionInterface) {
    if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
    const interval = this.configService.get().romach.hierarchy.pollInterval;
    const romachRepository =
      this.romachRepositoryFactoryService.create(reality);
    const romachEntitiesApi =
      this.romachEntitiesApiFactoryService.create(reality);

    const hierarchyReplicationService = new HierarchyReplicationService({
      reality,
      interval,
      logger: this.logger,
      romachEntitiesApi,
      leaderElection,
      romachRepository,
    });
    this.perRealityMap.set(reality, hierarchyReplicationService);
    return hierarchyReplicationService;
  }
}
