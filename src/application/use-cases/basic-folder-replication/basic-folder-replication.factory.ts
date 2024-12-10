import { RomachEntitiesApiFactoryService } from '../../../infra/romach-api/romach-entities-api/romach-entities-api-factory.service';
import { BasicFolderChangeHandlerFactory } from '../../services/basic-folder-change-handler/basic-folder-change-handler.factory';
import { BasicFoldersRepositoryFactory } from '../../../infra/romach-repository/basic-folders/basic-folders-repository-factory';
import { BasicFoldersReplicationUseCase } from './basic-folder-replication-use-case.service';
import { AppConfigService } from '../../../infra/config/app-config/app-config.service';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BasicFolderReplicationFactory {
    private perRealityMap: Map<string, BasicFoldersReplicationUseCase>;

    constructor(
        private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactory,
        private basicFolderChangeHandlerFactory: BasicFolderChangeHandlerFactory,
        private configService: AppConfigService,
        @Inject('POLL_INTERVAL') private pollInterval: number,
        @Inject('RETRY_INTERVAL') private retryInterval: number,
        @Inject('MAX_RETRY') private maxRetry: number,
        private logger: AppLoggerService,
    ) {
        this.perRealityMap = new Map<string, BasicFoldersReplicationUseCase>();
    }

    create(reality: RealityId, leaderElection: LeaderElectionInterface) {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const basicFolderRepository = this.basicFoldersRepositoryFactoryService.create(reality);
        const romachEntitiesApi = this.romachEntitiesApiFactoryService.create(reality);
        const basicFolderChangeHandlerFactory = this.basicFolderChangeHandlerFactory.create(reality);

        const basicFolderService = new BasicFoldersReplicationUseCase({
            maxRetry: this.maxRetry,
            leaderElection,
            logger: this.logger,
            pollInterval: this.pollInterval,
            retryInterval: this.retryInterval,
            romachApi: romachEntitiesApi,
            romachBasicFolderRepositoryInterface: basicFolderRepository,
            basicFolderChangeHandlerService: basicFolderChangeHandlerFactory,
        });
        this.perRealityMap.set(reality, basicFolderService);
        return basicFolderService;
    }
}
