import { AppConfigService } from '../config/app-config/app-config.service';
import { AppLoggerService } from './app-logger.service';
import { Global, Module } from '@nestjs/common';
import { loggerOptionsFactory } from './logger';
import { WinstonModule } from 'nest-winston';

@Global()
@Module({
    imports: [
        WinstonModule.forRootAsync({
            useFactory: (configService: AppConfigService) => {
                const config = configService.get();
                return loggerOptionsFactory(config.logger.name, config.logger.level);
            },
            inject: [AppConfigService],
        }),
    ],
    providers: [AppLoggerService],
    exports: [AppLoggerService],
})
export class LoggingModule {}
