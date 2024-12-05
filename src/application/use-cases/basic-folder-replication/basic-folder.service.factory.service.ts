import { BasicFoldersRepositoryFactoryService } from '../../../infra/romach-repository/repository-factory/basic-folders-repository-factory.service';
import { RomachEntitiesApiFactoryService } from '../../../infra/romach-api/romach-entities-api/romach-entities-api-factory.service';
import {
    BasicFolderReplicationHandlerFn,
    BasicFoldersReplicationUseCase,
} from './basic-folder-replication-use-case.service';
import { AppConfigService } from '../../../infra/config/app-config/app-config.service';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BasicFolderServiceFactoryService {
    private perRealityMap: Map<string, BasicFoldersReplicationUseCase>;
    private configService: AppConfigService;

    constructor(
        private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactoryService,
        private configService: AppConfigService,
        private pollInterval: number,
        private retryInterval: number,
        private maxRetry: number,
        private handler: BasicFolderReplicationHandlerFn,
        private logger: AppLoggerService,
    ) {
        this.configService = configService;
        this.perRealityMap = new Map<string, BasicFoldersReplicationUseCase>();
    }

    create(reality: RealityId, leaderElection: LeaderElectionInterface) {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const interval = this.configService.get().romach.basicFolder.pollInterval;
        const maxRetry = this.configService.get().romach.basicFolder.maxRetry;
        const basicFolderRepository = this.basicFoldersRepositoryFactoryService.create(reality);
        const romachEntitiesApi = this.romachEntitiesApiFactoryService.create(reality);

        const basicFolderService = new BasicFoldersReplicationUseCase({
            maxRetry,
            leaderElection,
            logger: this.logger,
            pollInterval: interval,
            retryInterval: interval,
            romachApi: romachEntitiesApi,
            romachBasicFolderRepositoryInterface: basicFolderRepository,
            handler: this.handler,
        });
        this.perRealityMap.set(reality, basicFolderService);
        return basicFolderService;
    }
}
