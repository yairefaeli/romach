// import { RomachRefreshTokenApiClientService } from '../romach-refresh-token-api-client/romach-refresh-token-api-client.service';
// import { RomachLoginApiClientService } from '../romach-login-api-client/romach-login-api-client.service';
// import { AppConfigService } from '../../config/app-config/app-config.service';
// import { RomachApiJwtIssuerService } from './romach-api-jwt-issuer.service';
// import { AppLoggerService } from '../../logging/app-logger.service';
// import { Injectable } from '@nestjs/common';
//
// @Injectable()
// export class RomachApiJwtIssuerFactoryService {
//   private romachApiJwtIssuerService: RomachApiJwtIssuerService;
//
//   constructor(
//     private configService: AppConfigService,
//     private romachLoginApiService: RomachLoginApiClientService,
//     private romachRefreshTokenApiService: RomachRefreshTokenApiClientService,
//     private logger: AppLoggerService,
//   ) {}
//
//   create() {
//     if (this.romachApiJwtIssuerService) return this.romachApiJwtIssuerService;
//     const config = this.configService.get().romach;
//     const loginInterval = config.loginApi.interval;
//     const refreshTokenInterval = config.refreshTokenApi.interval;
//     this.romachApiJwtIssuerService = new RomachApiJwtIssuerService(
//       loginInterval,
//       refreshTokenInterval,
//       this.romachLoginApiService,
//       this.romachRefreshTokenApiService,
//       this.logger,
//     );
//     return this.romachApiJwtIssuerService;
//   }
// }
