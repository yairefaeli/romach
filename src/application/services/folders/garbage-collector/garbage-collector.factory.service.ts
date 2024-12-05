import { RegisteredFoldersRepositoryFactoryService } from '../../../../infra/romach-repository/repository-factory/regsiterd-folders-repository-factory.service';
import { AppConfigService } from '../../../../infra/config/app-config/app-config.service';
import { AppLoggerService } from '../../../../infra/logging/app-logger.service';
import { GarbageCollectorService } from './garbage-collector.service';
import { RealityId } from '../../../entities/reality-id';

export class GarbageCollectorFactoryService {
    private configService: AppConfigService;
    private perRealityMap: Map<RealityId, GarbageCollectorService>;

    constructor(
        private logger: AppLoggerService,
        private configService: AppConfigService,
        private registeredFoldersRepositoryFactoryService: RegisteredFoldersRepositoryFactoryService,
    ) {
        this.perRealityMap = new Map<RealityId, GarbageCollectorService>();
    }

    create(reality: RealityId): GarbageCollectorService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const registeredFoldersRepositoryFactoryService =
            this.registeredFoldersRepositoryFactoryService.create(reality);
        const maxRetry = this.configService.get().romach.garbageCollectorConfig.maxRetry;
        const gcInterval = this.configService.get().romach.garbageCollectorConfig.gcInterval;

        return new GarbageCollectorService({
            maxRetry,
            gcInterval,
            logger: this.logger,
            registeredFolderRepositoryInterface: registeredFoldersRepositoryFactoryService,
        });
    }
}
