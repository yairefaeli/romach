import { AppConfigService } from '../config/app-config/app-config.service';
import { AppLoggerService } from '../logging/app-logger.service';
import { KnexModule } from 'nestjs-knex';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        KnexModule.forRootAsync({
            useFactory: (configService: AppConfigService, logger: AppLoggerService) => {
                const config = configService.get().database;
                return {
                    config: {
                        client: 'pg',
                        connection: {
                            host: config.host,
                            port: config.port,
                            user: config.user,
                            password: config.password,
                            database: config.database,
                        },
                        useNullAsDefault: true,
                        pool: {
                            min: config.pool.min,
                            max: config.pool.max,
                            afterCreate: (conn, done) => {
                                conn.on('connect', () => {});
                                conn.on('error', (err) => {
                                    logger.error('knex connection error', err);
                                });
                                conn.on('query', function (queryData) {
                                    if (config.logging?.logEverySql) {
                                        logger.info('knex_database_query', {
                                            sql: queryData?.sql,
                                            bindings: config.logging.includeBindings ? queryData?.bindings : undefined,
                                        });
                                    }
                                });
                                done();
                            },
                        },
                    },
                };
            },
            inject: [AppConfigService, AppLoggerService],
        }),
    ],
})
export class DatabaseModule {}
