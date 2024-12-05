import { BasicFoldersRepositoryFactoryService } from '../../../infra/romach-repository/repository-factory/basic-folders-repository-factory.service';
import { UpdateBasicFoldersRepositoryService } from './update-basic-folders-repository.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateBasicFoldersRepositoryFactoryService {
    private perRealityMap: Map<RealityId, UpdateBasicFoldersRepositoryService>;

    constructor(
        private logger: AppLoggerService,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactoryService,
    ) {
        this.perRealityMap = new Map<RealityId, UpdateBasicFoldersRepositoryService>();
    }

    create(reality: RealityId): UpdateBasicFoldersRepositoryService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const basicFoldersRepositoryFactoryService = this.basicFoldersRepositoryFactoryService.create(reality);

        return new UpdateBasicFoldersRepositoryService({
            logger: this.logger,
            basicFolderRepositoryInterface: basicFoldersRepositoryFactoryService,
        });
    }
}
