import { UpdateBasicFoldersRepositoryFactory } from '../update-basic-folder-repository/update-basic-folders-repository.factory';
import { BasicFolderChangeDetectionFactory } from '../basic-folder-change-detection/basic-folder-change-detection.factory';
import { UpdatedRegisterFolderFactory } from '../folders/update-registered-folders/updated-register-folder.factory';
import { TreeCalculationHandlerFactory } from '../tree-calculation-handler/tree-calculation-handler.factory';
import { BasicFolderChangeHandlerService } from './basic-folder-change-handler.service';
import { AppConfigService } from '../../../infra/config/app-config/app-config.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BasicFolderChangeHandlerFactory {
    private perRealityMap: Map<RealityId, BasicFolderChangeHandlerService>;
    private configService: AppConfigService;

    constructor(
        private logger: AppLoggerService,
        private treeCalculationHandlerFactoryService: TreeCalculationHandlerFactory,
        private updatedRegisterFolderFactoryService: UpdatedRegisterFolderFactory,
        private basicFolderChangeDetectionFactoryService: BasicFolderChangeDetectionFactory,
        private updateBasicFoldersRepositoryFactoryService: UpdateBasicFoldersRepositoryFactory,
    ) {
        this.perRealityMap = new Map<RealityId, BasicFolderChangeHandlerService>();
    }

    create(reality: RealityId): BasicFolderChangeHandlerService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const maxRetry = this.configService.get().romach.basicFolder.maxRetry;
        const treeCalculationHandlerFactoryService = this.treeCalculationHandlerFactoryService.create(reality);
        const updatedRegisterFolderFactoryService = this.updatedRegisterFolderFactoryService.create(reality);
        const basicFolderChangeDetectionFactoryService = this.basicFolderChangeDetectionFactoryService.create(reality);
        const updateBasicFoldersRepositoryFactoryService =
            this.updateBasicFoldersRepositoryFactoryService.create(reality);

        return new BasicFolderChangeHandlerService({
            maxRetry,
            logger: this.logger,
            treeCalculatorHandlerService: treeCalculationHandlerFactoryService,
            updateRegisteredFoldersService: updatedRegisterFolderFactoryService,
            updateBasicFoldersRepositoryService: updateBasicFoldersRepositoryFactoryService,
            basicFolderChangeDetectionService: basicFolderChangeDetectionFactoryService,
        });
    }
}
