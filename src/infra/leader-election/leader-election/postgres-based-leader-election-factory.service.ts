import { LeaderElectionOptions, PostgresBasedLeaderElection } from './postgres-based-leader-election';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Injectable } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class LeaderElectionFactoryService {
    constructor(
        @InjectKnex() private readonly knex: Knex,
        private readonly logger: AppLoggerService,
    ) {}

    async create(options: LeaderElectionOptions): Promise<PostgresBasedLeaderElection> {
        const postgresBasedLeaderElection = new PostgresBasedLeaderElection(this.knex, this.logger, options);
        await postgresBasedLeaderElection.start();
        return postgresBasedLeaderElection;
    }
}
