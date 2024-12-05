import { RegisteredFoldersRepositoryService } from '../registered-folders-repository.service';
import { RealityId } from '../../../application/entities/reality-id';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Injectable } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class RegisteredFoldersRepositoryFactoryService {
    private perRealityMap: Map<RealityId, RegisteredFoldersRepositoryService>;

    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly logger: AppLoggerService,
    ) {
        this.perRealityMap = new Map<RealityId, RegisteredFoldersRepositoryService>();
    }

    create(reality: RealityId) {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
        const repository = new RegisteredFoldersRepositoryService(this.knex, this.logger);
        this.perRealityMap.set(reality, repository);
        return repository;
    }
}
