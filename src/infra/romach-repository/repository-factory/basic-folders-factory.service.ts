import { BasicFoldersRepositoryInterface } from '../../../application/interfaces/basic-folders-repository/basic-folders-repository.interface';
import { RealityId } from '../../../application/entities/reality-id';
import { BasicFoldersRepository } from '../basic-folders-repository';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Injectable } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class BasicFoldersFactoryService {
    private perRealityMap: Map<RealityId, BasicFoldersRepository>;

    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly logger: AppLoggerService,
    ) {
        this.perRealityMap = new Map<RealityId, BasicFoldersRepository>();
    }

    create(reality: RealityId): BasicFoldersRepositoryInterface {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
        const repository = new BasicFoldersRepository(this.knex, this.logger);
        this.perRealityMap.set(reality, repository);
        return repository;
    }
}
