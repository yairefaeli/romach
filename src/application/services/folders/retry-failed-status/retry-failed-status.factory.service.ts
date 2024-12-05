import { RegisteredFoldersRepositoryFactoryService } from '../../../../infra/romach-repository/repository-factory/regsiterd-folders-repository-factory.service';
import { RomachEntitiesApiFactoryService } from '../../../../infra/romach-api/romach-entities-api/romach-entities-api-factory.service';
import { AppConfigService } from '../../../../infra/config/app-config/app-config.service';
import { AppLoggerService } from '../../../../infra/logging/app-logger.service';
import { RetryFailedStatusService } from './retry-failed-status.service';
import { RealityId } from '../../../entities/reality-id';

export class RetryFailedStatusFactoryService {
    private configService: AppConfigService;
    private perRealityMap: Map<RealityId, RetryFailedStatusService>;

    constructor(
        private logger: AppLoggerService,
        private configService: AppConfigService,
        private registeredFoldersRepositoryFactoryService: RegisteredFoldersRepositoryFactoryService,
        private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
    ) {
        this.perRealityMap = new Map<RealityId, RetryFailedStatusService>();
    }

    create(reality: RealityId): RetryFailedStatusService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const registeredFoldersRepositoryFactoryService =
            this.registeredFoldersRepositoryFactoryService.create(reality);
        const maxRetry = this.configService.get().romach.retryIntervalConfig.maxRetry;
        const retryInterval = this.configService.get().romach.retryIntervalConfig.retryInterval;
        const romachEntitiesApiFactoryService = this.romachEntitiesApiFactoryService.create(reality);

        return new RetryFailedStatusService({
            maxRetry,
            retryInterval,
            logger: this.logger,
            romachEntitiesApi: romachEntitiesApiFactoryService,
            registeredFolderRepositoryInterface: registeredFoldersRepositoryFactoryService,
        });
    }
}
