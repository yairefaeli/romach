import { BasicFoldersRepositoryFactoryService } from '../../../infra/romach-repository/repository-factory/basic-folders-repository-factory.service';
import { RomachEntitiesApiFactoryService } from '../../../infra/romach-api/romach-entities-api/romach-entities-api-factory.service';
import { RegisteredFoldersServiceFactory } from '../../services/folders/registered-folders/registered-folders.service.factory';
import { AddProtectedFolderToUserUseCaseService } from './add-protected-folder-to-user.use-case.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AddProtectedFolderToUserUseCaseFactory {
    private perRealityMap: Map<RealityId, AddProtectedFolderToUserUseCaseService>;

    constructor(
        private logger: AppLoggerService,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactoryService,
        private registeredFoldersFactory: RegisteredFoldersServiceFactory,
        private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
    ) {
        this.perRealityMap = new Map<RealityId, AddProtectedFolderToUserUseCaseService>();
    }

    create(reality: RealityId): AddProtectedFolderToUserUseCaseService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const romachEntitiesApi = this.romachEntitiesApiFactoryService.create(reality);
        const registerFolderFactoryService = this.registeredFoldersFactory.create(reality);
        const basicFoldersRepositoryFactoryService = this.basicFoldersRepositoryFactoryService.create(reality);

        return new AddProtectedFolderToUserUseCaseService({
            logger: this.logger,
            api: romachEntitiesApi,
            romachBasicFolderRepositoryInterface: basicFoldersRepositoryFactoryService,
            registeredFolderService: registerFolderFactoryService,
        });
    }
}
