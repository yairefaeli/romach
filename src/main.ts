/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { AppConfigService } from './infra/config/app-config/app-config.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const config = app.get(AppConfigService);
    const port = config.get().server.port;
    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
