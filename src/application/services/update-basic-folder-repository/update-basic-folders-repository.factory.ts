import { BasicFoldersRepositoryFactory } from '../../../infra/romach-repository/basic-folders/basic-folders-repository-factory';
import { UpdateBasicFoldersRepositoryService } from './update-basic-folders-repository.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateBasicFoldersRepositoryFactory {
    private perRealityMap: Map<RealityId, UpdateBasicFoldersRepositoryService>;

    constructor(
        private logger: AppLoggerService,
        private basicFoldersRepositoryFactoryService: BasicFoldersRepositoryFactory,
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
