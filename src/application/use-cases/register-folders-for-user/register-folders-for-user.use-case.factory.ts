import { RegisteredFoldersRepositoryFactory } from '../../../infra/romach-repository/registered-folders/regsiterd-folders-repository-factory';
import { RegisterFoldersForUserUseCase } from './register-folders-for-user.use-case.service';
import { AppConfigService } from '../../../infra/config/app-config/app-config.service';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RegisterFoldersForUserUseCaseFactory {
    private perRealityMap: Map<RealityId, RegisterFoldersForUserUseCase>;

    constructor(
        private logger: AppLoggerService,
        private registeredFoldersFactory: RegisteredFoldersRepositoryFactory,
        private configService: AppConfigService,
    ) {
        this.perRealityMap = new Map<RealityId, RegisterFoldersForUserUseCase>();
    }

    create(reality: RealityId): RegisterFoldersForUserUseCase {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

        const maxRetry = this.configService.get().romach.registeredFolderConfig.maxRetry;
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
