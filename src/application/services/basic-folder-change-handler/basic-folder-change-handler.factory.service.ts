import { UpdateBasicFoldersRepositoryFactoryService } from '../update-basic-folder-repository/update-basic-folders-repository.factory.service';
import { BasicFolderChangeDetectionFactoryService } from '../basic-folder-change-detection/basic-folder-change-detection.factory.service';
import { UpdatedRegisterFolderFactoryService } from '../folders/update-registered-folders/updated-register-folder.factory.service';
import { TreeCalculationHandlerFactoryService } from '../tree-calculation-handler/tree-calculation-handler.factory.service';
import { BasicFolderChangeHandlerService } from './basic-folder-change-handler.service';
import { AppConfigService } from '../../../infra/config/app-config/app-config.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BasicFolderChangeHandlerServiceFactory {
    private perRealityMap: Map<RealityId, BasicFolderChangeHandlerService>;
    private configService: AppConfigService;

    constructor(
        private logger: AppLoggerService,
        private treeCalculationHandlerFactoryService: TreeCalculationHandlerFactoryService,
        private updatedRegisterFolderFactoryService: UpdatedRegisterFolderFactoryService,
        private basicFolderChangeDetectionFactoryService: BasicFolderChangeDetectionFactoryService,
        private updateBasicFoldersRepositoryFactoryService: UpdateBasicFoldersRepositoryFactoryService,
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
