// import { RomachEntitiesApiInterface } from '../../../application/interfaces/romach-entites-api/romach-entities-api.interface';
// import { RomachApiGraphqlClientFactoryService } from '../romach-api-graphql-client/romach-api-graphql-client-factory.service';
// import { RomachEntitiesApiService } from './romach-entities-api.service';
// import { RealityId } from '../../../application/entities/reality-id';
// import { AppLoggerService } from '../../logging/app-logger.service';
// import { Injectable } from '@nestjs/common';
//
// @Injectable()
// export class RomachEntitiesApiFactoryService {
//     private perRealityMap: Map<RealityId, RomachEntitiesApiService>;
//
//     constructor(
//         private logger: AppLoggerService,
//         private romachApiGraphqlClientFactoryService: RomachApiGraphqlClientFactoryService,
//     ) {
//         this.perRealityMap = new Map<RealityId, RomachEntitiesApiService>();
//     }
//
//     create(reality: RealityId): RomachEntitiesApiInterface {
//         if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
//
//         const romachApiGraphqlClientService = this.romachApiGraphqlClientFactoryService.create(reality);
//
//         const romachEntitiesApiService = new RomachEntitiesApiService(romachApiGraphqlClientService, this.logger);
//
//         this.perRealityMap.set(reality, romachEntitiesApiService);
//
//         return romachEntitiesApiService;
//     }
// }
