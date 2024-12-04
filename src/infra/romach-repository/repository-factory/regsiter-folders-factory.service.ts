import { RegisteredFolderRepositoryInterface } from '../../../application/interfaces/registered-folders-repository/registered-folder-repository.interface';
import { RegisteredFoldersRepository } from '../registered-folders-repository';
import { RealityId } from '../../../application/entities/reality-id';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Injectable } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class RegsiterFoldersFactoryService {
    private perRealityMap: Map<RealityId, RegisteredFoldersRepository>;

    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly logger: AppLoggerService,
    ) {
        this.perRealityMap = new Map<RealityId, RegisteredFoldersRepository>();
    }

    create(reality: RealityId): RegisteredFolderRepositoryInterface {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
        const repository = new RegisteredFoldersRepository(this.knex, this.logger);
        this.perRealityMap.set(reality, repository);
        return repository;
    }
}
