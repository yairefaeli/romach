import { RegisteredFoldersRepositoryFactoryService } from '../../../infra/romach-repository/repository-factory/regsiterd-folders-repository-factory.service';
import { RegisterFoldersForUserUseCase } from './register-folders-for-user.use-case.service';
import { AppConfigService } from '../../../infra/config/app-config/app-config.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RegisterFoldersForUserUseCaseFactoryService {
    private perRealityMap: Map<RealityId, RegisterFoldersForUserUseCase>;
    private configService: AppConfigService;

    constructor(
        private logger: AppLoggerService,
        private registeredFoldersFactory: RegisteredFoldersRepositoryFactoryService,
        private configService: AppConfigService,
    ) {
        this.perRealityMap = new Map<RealityId, RegisterFoldersForUserUseCase>();
    }

    create(reality: RealityId): RegisterFoldersForUserUseCase {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const maxRetry = this.configService.get().romach.regsiteredFolderConfig.maxRetry;
        const registeredFoldersFactory = this.registeredFoldersFactory.create(reality);

        const RegisterFoldersForUser = new RegisterFoldersForUserUseCase({
            maxRetry,
            logger: this.logger,
            registeredFolderRepositoryInterface: registeredFoldersFactory,
        });

        this.perRealityMap.set(reality, RegisterFoldersForUser);
        return RegisterFoldersForUser;
    }
}
