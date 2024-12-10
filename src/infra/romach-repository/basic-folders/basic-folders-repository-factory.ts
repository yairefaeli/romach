import { BasicFoldersRepositoryService } from './basic-folders-repository.service';
import { RealityId } from '../../../application/entities/reality-id';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Injectable } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class BasicFoldersRepositoryFactory {
    private perRealityMap: Map<RealityId, BasicFoldersRepositoryService>;

    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly logger: AppLoggerService,
    ) {
        this.perRealityMap = new Map<RealityId, BasicFoldersRepositoryService>();
    }

    create(reality: RealityId) {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
        const repository = new BasicFoldersRepositoryService(this.knex, this.logger);
        this.perRealityMap.set(reality, repository);
        return repository;
    }
}
