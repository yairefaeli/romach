import { RomachRepositoryInterface } from '../../../application/interfaces/romach-repository.interface';
import { RomachRepositoryService } from './romach-repository.service';
import { RealityId } from '../../application/entities/reality-id';
import { AppLoggerService } from '../logging/app-logger.service';
import { Injectable } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class RomachRepositoryFactoryService {
  private perRealityMap: Map<RealityId, RomachRepositoryService>;

  constructor(
    @InjectKnex() private readonly knex: Knex,
    private readonly logger: AppLoggerService,
  ) {
    this.perRealityMap = new Map<RealityId, RomachRepositoryService>();
  }

  create(reality: RealityId): RomachRepositoryInterface {
    if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
    const repository = new RomachRepositoryService(
      this.knex,
      this.logger,
      reality,
    );
    this.perRealityMap.set(reality, repository);
    return repository;
  }
}
