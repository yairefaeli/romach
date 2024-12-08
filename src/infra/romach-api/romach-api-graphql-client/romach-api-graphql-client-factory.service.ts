// import { Injectable } from '@nestjs/common';
// import { RealityId } from '../../../application/entities/reality-id';
// import { RomachApiGraphqlClientService } from './romach-api-graphql-client.service';
// import { RomachApiJwtIssuerFactoryService } from '../romach-api-jwt-issuer/romach-api-jwt-issuer-factory.service';
// import { AppConfigService } from '../../config/app-config/app-config.service';
//
// @Injectable()
// export class RomachApiGraphqlClientFactoryService {
//   private perRealityMap: Map<RealityId, RomachApiGraphqlClientService>;
//
//   constructor(
//     private romachApiJwtIssuerFactoryService: RomachApiJwtIssuerFactoryService,
//     private configService: AppConfigService,
//   ) {
//     this.perRealityMap = new Map<RealityId, RomachApiGraphqlClientService>();
//   }
//
//   create(reality: RealityId): RomachApiGraphqlClientService {
//     const config = this.configService.get().romach.entitiesApi;
//     if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
//     const service = new RomachApiGraphqlClientService(
//       reality,
//       config.url,
//       config.timeout,
//       this.romachApiJwtIssuerFactoryService.create(),
//     );
//     this.perRealityMap.set(reality, service);
//   }
// }
