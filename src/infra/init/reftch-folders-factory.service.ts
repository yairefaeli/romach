import { Injectable } from "@nestjs/common";
import { AppConfigService } from "../config/app-config/app-config.service";
import { RomachRepositoryFactoryService } from "../romach-repository/romach-repository-factory.service";
import { RomachEntitiesApiFactoryService } from "../romach-api/romach-entities-api/romach-entities-api-factory.service";
import { RefetchFoldersService } from "src/application/use-cases/refetch-folders/refetch-folders.use-case.service";
import { AppLoggerService } from "../logging/app-logger.service";
import { RealityId } from "src/application/entities/reality-id";
import { Event, EventEmitterInterface } from "src/application/interfaces/event-handler-interface";

@Injectable()
export class RefetchFoldersFactoryService {
  private perRealityMap: Map<string, RefetchFoldersService>;

  constructor(
    private romachRepositoryFactoryService: RomachRepositoryFactoryService,
    private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
    private configService: AppConfigService,
    private logger: AppLoggerService,
    private eventEmitter: EventEmitterInterface
  ) {
    this.perRealityMap = new Map<string, RefetchFoldersService>();
  }

  create(reality: RealityId) {
    if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

    const interval = this.configService.get().romach.refetchFolders.pollInterval;
    const chunkSize = this.configService.get().romach.refetchFolders.chunkSize;
    const romachRepository = this.romachRepositoryFactoryService.create(reality);
    const romachEntitiesApi = this.romachEntitiesApiFactoryService.create(reality);

    const refetchFoldersService = new RefetchFoldersService({
      romachApi: romachEntitiesApi,
      repository: romachRepository,
      logger: this.logger,
      reality,
      interval,
      chunkSize,
    });

    this.perRealityMap.set(reality, refetchFoldersService);
    return refetchFoldersService;
  }
}
