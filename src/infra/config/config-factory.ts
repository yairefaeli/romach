import { Configuration } from './configuration';
import { ConfigFactory } from '@nestjs/config';
import { from } from 'env-var';
import ms from 'ms';

const env = from(process.env, {
    asMs: (value) => ms(value),
});

export const configFactory: ConfigFactory<{ config: Configuration }> = () => {
    return {
        config: {
            logger: {
                level: env.get('LOGGER_LEVEL').default('debug').asEnum(['error', 'warn', 'info', 'debug']),
                name: env.get('LOGGER_NAME').default('romach-service').asString(),
            },
            database: {
                host: env.get('DATABASE_HOST').default('localhost').asString(),
                port: env.get('DATABASE_PORT').default(5432).asPortNumber(),
                user: env.get('DATABASE_USER').default('postgres').asString(),
                password: env.get('DATABASE_PASSWORD').default('postgrespassword').asString(),
                database: env.get('DATABASE_NAME').default('postgres').asString(),
                schema: env.get('DATABASE_SCHEMA').default('public').asString(),
                pool: {
                    min: env.get('DATABASE_POOL_MIN').default(2).asIntPositive(),
                    max: env.get('DATABASE_POOL_MAX').default(10).asIntPositive(),
                },
                logging: {
                    logEverySql: env.get('DATABASE_LOG_EVERY_SQL').default('true').asBool(),
                    includeBindings: env.get('DATABASE_LOG_INCLUDE_BINDINGS').default('false').asBool(),
                },
            },
            server: {
                port: env.get('SERVER_PORT').default(3000).asPortNumber(),
            },
            jwt: {
                secret: env.get('JWT_SECRET').required().asString(),
            },
            romach: {
                realities: env.get('ROMACH_REALITIES').default('reality1').asArray(),
                hierarchy: {
                    pollInterval: env.get('ROMACH_HIERARCHY_POLL_INTERVAL').default('2s').asMs(),
                },
                entitiesApi: {
                    url: env.get('ROMACH_ENTITIES_API_URL').required().asString(),
                    timeout: env.get('ROMACH_ENTITIES_API_TIMEOUT').default('10s').asMs(),
                },
                loginApi: {
                    url: env.get('ROMACH_LOGIN_API_URL').required().asString(),
                    clientId: env.get('ROMACH_LOGIN_API_CLIENT_ID').required().asString(),
                    clientSecret: env.get('ROMACH_LOGIN_API_CLIENT_SECRET').required().asString(),
                    timeout: env.get('ROMACH_LOGIN_API_TIMEOUT').default('10s').asMs(),
                    interval: env.get('ROMACH_LOGIN_API_INTERVAL').default('5s').asMs(),
                },
                refreshTokenApi: {
                    url: env.get('ROMACH_REFRESH_TOKEN_API_URL').required().asString(),
                    timeout: env.get('ROMACH_REFRESH_TOKEN_API_TIMEOUT').default('10s').asMs(),
                    interval: env.get('ROMACH_REFRESH_TOKEN_API_INTERVAL').default('1h').asMs(),
                },
                basicFolder: {
                    pollInterval: env.get('ROMACH_BASIC_FOLDER_POLL_INTERVAL').default('1m').asMs(),
                },
            },
        },
    };
};
