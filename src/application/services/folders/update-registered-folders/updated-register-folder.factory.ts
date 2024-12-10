import { RegisteredFoldersRepositoryFactory } from '../../../../infra/romach-repository/registered-folders/regsiterd-folders-repository-factory';
import { RomachEntitiesApiFactoryService } from '../../../../infra/romach-api/romach-entities-api/romach-entities-api-factory.service';
import { RegisteredFoldersFactory } from '../registered-folders/registered-folders.factory';
import { UpdateRegisteredFoldersService } from './update-registered-folders.service';
import { AppLoggerService } from '../../../../infra/logging/app-logger.service';
import { RealityId } from '../../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdatedRegisterFolderFactory {
    private perRealityMap: Map<RealityId, UpdateRegisteredFoldersService>;

    constructor(
        private logger: AppLoggerService,
        private registeredFoldersFactory: RegisteredFoldersFactory,
        private romachEntitiesApiFactoryService: RomachEntitiesApiFactoryService,
        private registeredFoldersRepositoryFactoryService: RegisteredFoldersRepositoryFactory,
    ) {
        this.perRealityMap = new Map<RealityId, UpdateRegisteredFoldersService>();
    }

    create(reality: RealityId): UpdateRegisteredFoldersService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const registeredFoldersRepositoryFactoryService =
            this.registeredFoldersRepositoryFactoryService.create(reality);
        const romachEntitiesApiFactoryService = this.romachEntitiesApiFactoryService.create(reality);
        const registeredFoldersFactory = this.registeredFoldersFactory.create(reality);

        return new UpdateRegisteredFoldersService({
            logger: this.logger,
            romachApi: romachEntitiesApiFactoryService,
            registeredFoldersService: registeredFoldersFactory,
            registeredFolderRepositoryInterface: registeredFoldersRepositoryFactoryService,
        });
    }
}
