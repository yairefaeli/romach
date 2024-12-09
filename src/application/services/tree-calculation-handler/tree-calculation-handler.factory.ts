import { BasicFoldersRepositoryFactory } from '../../../infra/romach-repository/basic-folders/basic-folders-repository-factory';
import { HierarchyRepositoryFactory } from '../../../infra/romach-repository/hierarchy/hierarchy-repository-factory';
import { TreeCalculationService } from '../../../domain/services/tree-calculation/tree-calculation.service';
import { AppConfigService } from '../../../infra/config/app-config/app-config.service';
import { TreeCalculationHandlerService } from './tree-calculation-handler.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TreeCalculationHandlerFactory {
    private configService: AppConfigService;
    private perRealityMap: Map<RealityId, TreeCalculationHandlerService>;

    constructor(
        private logger: AppLoggerService,
        private hierarchiesRepositoryFactoryService: HierarchyRepositoryFactory,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactory,
    ) {
        this.perRealityMap = new Map<RealityId, TreeCalculationHandlerService>();
    }

    create(reality: RealityId): TreeCalculationHandlerService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const maxRetry = this.configService.get().romach.basicFolder.maxRetry;
        const treeCalculationService = new TreeCalculationService();
        const hierarchiesRepositoryFactoryService = this.hierarchiesRepositoryFactoryService.create(reality);
        const basicFoldersRepositoryFactoryService = this.basicFoldersRepositoryFactoryService.create(reality);
        return new TreeCalculationHandlerService({
            maxRetry,
            logger: this.logger,
            treeCalculationService,
            hierarchiesRepositoryInterface: hierarchiesRepositoryFactoryService,
            basicFolderRepositoryInterface: basicFoldersRepositoryFactoryService,
        });
    }
}
