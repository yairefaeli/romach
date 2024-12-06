import { BasicFoldersRepositoryFactoryService } from '../../../infra/romach-repository/repository-factory/basic-folders-repository-factory.service';
import { BasicFolderChangeDetectionService } from './basic-folder-change-detection.service';
import { AppConfigService } from '../../../infra/config/app-config/app-config.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BasicFolderChangeDetectionFactoryService {
    private perRealityMap: Map<RealityId, BasicFolderChangeDetectionService>;

    constructor(
        private logger: AppLoggerService,
        private configService: AppConfigService,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactoryService,
    ) {
        this.perRealityMap = new Map<RealityId, BasicFolderChangeDetectionService>();
    }

    create(reality: RealityId): BasicFolderChangeDetectionService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const maxRetry = this.configService.get().romach.basicFolder.maxRetry;
        const basicFoldersRepositoryFactoryService = this.basicFoldersRepositoryFactoryService.create(reality);

        return new BasicFolderChangeDetectionService({
            maxRetry,
            logger: this.logger,
            basicFolderRepositoryInterface: basicFoldersRepositoryFactoryService,
        });
    }
}
