import { RomachRefreshTokenApiClientService } from './romach-refresh-token-api-client/romach-refresh-token-api-client.service';
import { RomachApiGraphqlClientService } from './romach-api-graphql-client/romach-api-graphql-client.service';
import { RomachLoginApiClientService } from './romach-login-api-client/romach-login-api-client.service';
import { RomachApiRestClientService } from './romach-api-rest-client/romach-api-rest-client.service';
import { RomachApiJwtIssuerService } from './romach-api-jwt-issuer/romach-api-jwt-issuer.service';
import { RomachEntitiesApiService } from './romach-entities-api/romach-entities-api.service';
import { AppConfigService } from '../config/app-config/app-config.service';
import { LoggingModule } from '../logging/logging.module';
import { AppConfigModule } from '../config/config.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [AppConfigModule, LoggingModule],
    providers: [
        RomachLoginApiClientService,
        RomachApiGraphqlClientService,
        RomachRefreshTokenApiClientService,
        {
            provide: RomachApiRestClientService,
            useFactory: (appConfigService: AppConfigService) => {
                const { url, timeout } = appConfigService.get().romach.refreshTokenApi;
                return new RomachApiRestClientService(url, timeout);
            },
            inject: [AppConfigService],
        },
    ],
    exports: [RomachApiJwtIssuerService, RomachEntitiesApiService],
})
export class RomachApiModule {}
