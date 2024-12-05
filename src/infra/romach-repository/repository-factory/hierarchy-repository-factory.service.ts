import { HierarchiesRepositoryService } from '../hierarchies-repository.service';
import { RealityId } from '../../../application/entities/reality-id';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Injectable } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class HierarchyRepositoryFactoryService {
    private perRealityMap: Map<RealityId, HierarchiesRepositoryService>;

    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly logger: AppLoggerService,
    ) {
        this.perRealityMap = new Map<RealityId, HierarchiesRepositoryService>();
    }

    create(reality: RealityId) {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
        const repository = new HierarchiesRepositoryService(this.knex, this.logger, reality);
        this.perRealityMap.set(reality, repository);
        return repository;
    }
}
