import { RegsiterFoldersFactoryService } from '../../../../infra/romach-repository/repository-factory/regsiter-folders-factory.service';
import { AppLoggerService } from '../../../../infra/logging/app-logger.service';
import { RegisteredFoldersService } from './registered-folders.service';
import { RealityId } from '../../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RegisteredFoldersFactoryService {
    private perRealityMap: Map<RealityId, RegisteredFoldersService>;

    constructor(
        private registeredFoldersRepository: RegsiterFoldersFactoryService,
        private readonly logger: AppLoggerService,
    ) {
        this.perRealityMap = new Map<RealityId, RegisteredFoldersService>();
    }

    create(reality: RealityId): RegisteredFoldersService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const repo = this.registeredFoldersRepository.create(reality);

        return new RegisteredFoldersService({ logger: this.logger, registeredFoldersRepository: repo });
    }
}
