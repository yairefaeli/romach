import { RomachEntitiesApiFactoryService } from '../../../infra/romach-api/romach-entities-api/romach-entities-api-factory.service';
import { BasicFoldersRepositoryFactory } from '../../../infra/romach-repository/basic-folders/basic-folders-repository-factory';
import { RegisteredFoldersFactory } from '../../services/folders/registered-folders/registered-folders.factory';
import { AddProtectedFolderToUserUseCase } from './add-protected-folder-to-user.use-case.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AddProtectedFolderToUserUseCaseFactory {
    private perRealityMap: Map<RealityId, AddProtectedFolderToUserUseCase>;

    constructor(
        private logger: AppLoggerService,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactory,
        private registeredFoldersFactory: RegisteredFoldersFactory,
        private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
    ) {
        this.perRealityMap = new Map<RealityId, AddProtectedFolderToUserUseCase>();
    }

    create(reality: RealityId): AddProtectedFolderToUserUseCase {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const romachEntitiesApi = this.romachEntitiesApiFactoryService.create(reality);
        const registeredFoldersFactory = this.registeredFoldersFactory.create(reality);
        const basicFoldersRepositoryFactoryService = this.basicFoldersRepositoryFactoryService.create(reality);

        return new AddProtectedFolderToUserUseCase({
            logger: this.logger,
            api: romachEntitiesApi,
            romachBasicFolderRepositoryInterface: basicFoldersRepositoryFactoryService,
            registeredFolderService: registeredFoldersFactory,
        });
    }
}
