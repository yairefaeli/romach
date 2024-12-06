import { GetUserRegisteredFoldersUseCaseFactoryService } from '../../../application/use-cases/get-user-registered-folders-use-case/get-user-registered-folders-use-case-factory.service';
import { AddProtectedFolderToUserUseCaseFactory } from '../../../application/use-cases/add-protected-folder-to-user/add-protected-folder-to-user-use-case.factory.service';
import { RegisteredFoldersRepositoryFactoryService } from '../../romach-repository/repository-factory/regsiterd-folders-repository-factory.service';
import { RegisteredFoldersServiceFactory } from '../../../application/services/folders/registered-folders/registered-folders.service.factory';
import { RomachRefreshTokenApiClientService } from '../../romach-api/romach-refresh-token-api-client/romach-refresh-token-api-client.service';
import { RomachApiGraphqlClientFactoryService } from '../../romach-api/romach-api-graphql-client/romach-api-graphql-client-factory.service';
import { BasicFoldersRepositoryFactoryService } from '../../romach-repository/repository-factory/basic-folders-repository-factory.service';
import { RomachApiJwtIssuerFactoryService } from '../../romach-api/romach-api-jwt-issuer/romach-api-jwt-issuer-factory.service';
import { AddProtectedFolderToUserController } from './add-protected-folder-to-user/add-protected-folder-to-user.controller';
import { RomachEntitiesApiFactoryService } from '../../romach-api/romach-entities-api/romach-entities-api-factory.service';
import { GetRegisterFoldersByUpnController } from './get-register-folders-by-upn/get-register-folders-by-upn.controller';
import { RomachLoginApiClientService } from '../../romach-api/romach-login-api-client/romach-login-api-client.service';
import { RegisteredFoldersRepositoryService } from '../../romach-repository/registered-folders-repository.service';
import { RomachRepositoryModule } from '../../romach-repository/repository.module';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [RomachRepositoryModule],
    controllers: [GetRegisterFoldersByUpnController, AddProtectedFolderToUserController],
    providers: [
        GetUserRegisteredFoldersUseCaseFactoryService,
        AddProtectedFolderToUserUseCaseFactory,
        AppLoggerService,
        BasicFoldersRepositoryFactoryService,
        RegisteredFoldersRepositoryFactoryService,
        RegisteredFoldersServiceFactory,
        RomachEntitiesApiFactoryService,
        RomachApiGraphqlClientFactoryService,
        RomachApiJwtIssuerFactoryService,
        RomachRefreshTokenApiClientService,
        RomachLoginApiClientService,
        { provide: 'RegisteredFolderRepository', useClass: RegisteredFoldersRepositoryService },
    ],
})
export class EndpointModule {}
