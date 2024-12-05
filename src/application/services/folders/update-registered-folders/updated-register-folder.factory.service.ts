import { RegisteredFoldersRepositoryFactoryService } from '../../../../infra/romach-repository/repository-factory/regsiterd-folders-repository-factory.service';
import { RomachEntitiesApiFactoryService } from '../../../../infra/romach-api/romach-entities-api/romach-entities-api-factory.service';
import { RegisteredFoldersServiceFactory } from '../registered-folders/registered-folders.service.factory';
import { UpdateRegisteredFoldersService } from './update-registered-folders.service';
import { AppLoggerService } from '../../../../infra/logging/app-logger.service';
import { RealityId } from '../../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdatedRegisterFolderFactoryService {
    private perRealityMap: Map<RealityId, UpdateRegisteredFoldersService>;

    constructor(
        private logger: AppLoggerService,
        private registeredFoldersService: RegisteredFoldersServiceFactory,
        private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
        private registeredFoldersRepositoryFactoryService: RegisteredFoldersRepositoryFactoryService,
    ) {
        this.perRealityMap = new Map<RealityId, UpdateRegisteredFoldersService>();
    }

    create(reality: RealityId): UpdateRegisteredFoldersService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const registeredFoldersRepositoryFactoryService =
            this.registeredFoldersRepositoryFactoryService.create(reality);
        const romachEntitiesApiFactoryService = this.romachEntitiesApiFactoryService.create(reality);
        const registeredFoldersService = this.registeredFoldersService.create(reality);

        return new UpdateRegisteredFoldersService({
            logger: this.logger,
            romachApi: romachEntitiesApiFactoryService,
            registeredFoldersService: registeredFoldersService,
            registeredFolderRepositoryInterface: registeredFoldersRepositoryFactoryService,
        });
    }
}
