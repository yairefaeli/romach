import { RomachRefreshTokenApiClientService } from './romach-refresh-token-api-client/romach-refresh-token-api-client.service';
import { RomachApiGraphqlClientFactoryService } from './romach-api-graphql-client/romach-api-graphql-client-factory.service';
import { RomachApiJwtIssuerFactoryService } from './romach-api-jwt-issuer/romach-api-jwt-issuer-factory.service';
import { RomachEntitiesApiFactoryService } from './romach-entities-api/romach-entities-api-factory.service';
import { RomachLoginApiClientService } from './romach-login-api-client/romach-login-api-client.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [
        RomachLoginApiClientService,
        RomachRefreshTokenApiClientService,
        RomachApiJwtIssuerFactoryService,
        RomachEntitiesApiFactoryService,
        RomachApiGraphqlClientFactoryService,
    ],
    exports: [RomachApiJwtIssuerFactoryService, RomachEntitiesApiFactoryService],
})
export class RomachApiModule {}
