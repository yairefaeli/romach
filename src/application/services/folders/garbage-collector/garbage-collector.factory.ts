import { RegisteredFoldersRepositoryFactory } from '../../../../infra/romach-repository/registered-folders/regsiterd-folders-repository-factory';
import { AppConfigService } from '../../../../infra/config/app-config/app-config.service';
import { AppLoggerService } from '../../../../infra/logging/app-logger.service';
import { GarbageCollectorService } from './garbage-collector.service';
import { RealityId } from '../../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GarbageCollectorFactory {
    private perRealityMap: Map<RealityId, GarbageCollectorService>;

    constructor(
        private logger: AppLoggerService,
        private configService: AppConfigService,
        private registeredFoldersRepositoryFactoryService: RegisteredFoldersRepositoryFactory,
    ) {
        this.perRealityMap = new Map<RealityId, GarbageCollectorService>();
        console.log('RegisteredFoldersRepositoryFactory:', registeredFoldersRepositoryFactoryService);
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
