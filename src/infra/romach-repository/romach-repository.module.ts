import { RegisteredFoldersRepositoryService } from './registered-folders-repository.service';
import { BasicFoldersRepositoryService } from './basic-folders-repository.service';
import { HierarchiesRepositoryService } from './hierarchies-repository.service';
import { KNEX_MODULE_CONNECTION } from 'nestjs-knex/dist/knex.constants';
import { DynamicModule, Inject, Module, Provider } from '@nestjs/common';
import { RealityId } from '../../application/entities/reality-id';
import { AppLoggerService } from '../logging/app-logger.service';
import { DatabaseModule } from '../database/database.module';
import { LoggingModule } from '../logging/logging.module';

const HierarchiesRepositoryServiceProvider = (realityId: RealityId): Provider => ({
    provide: 'HierarchiesRepository',
    useFactory: (knex, logger) => new HierarchiesRepositoryService(knex, logger, realityId),
    inject: [KNEX_MODULE_CONNECTION, AppLoggerService],
});

const BasicFoldersRepositoryServiceProvider: Provider = {
    provide: 'BasicFoldersRepository',
    useClass: BasicFoldersRepositoryService,
};

const RegisteredFoldersRepositoryServiceProvider: Provider = {
    provide: 'RegisteredFoldersRepository',
    useClass: RegisteredFoldersRepositoryService,
};

export const InjectHierarchiesRepository = () => Inject('HierarchiesRepository');
export const InjectBasicFoldersRepository = () => Inject('BasicFoldersRepository');
export const InjectRegisteredFoldersRepository = () => Inject('RegisteredFoldersRepository');

@Module({})
export class RomachRepositoryModule {
    static register(realityId: RealityId): DynamicModule {
        return {
            module: RomachRepositoryModule,
            imports: [LoggingModule, DatabaseModule],
            providers: [
                BasicFoldersRepositoryServiceProvider,
                RegisteredFoldersRepositoryServiceProvider,
                HierarchiesRepositoryServiceProvider(realityId),
            ],
            exports: [
                BasicFoldersRepositoryServiceProvider,
                RegisteredFoldersRepositoryServiceProvider,
                HierarchiesRepositoryServiceProvider(realityId),
            ],
        };
    }
}
