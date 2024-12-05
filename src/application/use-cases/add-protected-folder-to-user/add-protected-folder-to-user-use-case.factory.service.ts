import { BasicFoldersRepositoryFactoryService } from '../../../infra/romach-repository/repository-factory/basic-folders-repository-factory.service';
import { RomachEntitiesApiFactoryService } from '../../../infra/romach-api/romach-entities-api/romach-entities-api-factory.service';
import { RegisteredFoldersServiceFactory } from '../../services/folders/registered-folders/registered-folders.service.factory';
import { AddProtectedFolderToUserUseCase } from './add-protected-folder-to-user.use-case.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AddProtectedFolderToUserUseCaseFactory {
    private perRealityMap: Map<RealityId, AddProtectedFolderToUserUseCase>;

    constructor(
        private logger: AppLoggerService,
        private apiFactory: RomachEntitiesApiFactoryService,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactoryService,
        private registeredFoldersFactory: RegisteredFoldersServiceFactory,
    ) {
        this.perRealityMap = new Map<RealityId, AddProtectedFolderToUserUseCase>();
    }

    create(reality: RealityId): AddProtectedFolderToUserUseCase {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const api = this.apiFactory.create(reality);
        const repo = this.basicFoldersRepositoryFactoryService.create(reality);
        const registerFolderFactoryService = this.registeredFoldersFactory.create(reality);

        return new AddProtectedFolderToUserUseCase(this.logger, api, repo, registerFolderFactoryService);
    }
}
