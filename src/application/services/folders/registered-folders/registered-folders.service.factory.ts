import { RegisteredFoldersRepositoryFactoryService } from '../../../../infra/romach-repository/repository-factory/regsiterd-folders-repository-factory.service';
import { AppLoggerService } from '../../../../infra/logging/app-logger.service';
import { RegisteredFoldersService } from './registered-folders.service';
import { RealityId } from '../../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RegisteredFoldersServiceFactory {
    private perRealityMap: Map<RealityId, RegisteredFoldersService>;

    constructor(
        private registeredFoldersRepository: RegisteredFoldersRepositoryFactoryService,
        private readonly logger: AppLoggerService,
    ) {
        this.perRealityMap = new Map<RealityId, RegisteredFoldersService>();
    }

    create(reality: RealityId): RegisteredFoldersService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const registeredFoldersRepository = this.registeredFoldersRepository.create(reality);

        return new RegisteredFoldersService({ logger: this.logger, registeredFoldersRepository });
    }
}
