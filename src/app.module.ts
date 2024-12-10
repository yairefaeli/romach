import { ApplicationModule } from './application/application.module';
import { DomainModule } from './domain/domain.module';
import { InfraModule } from './infra/infra.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [DomainModule, ApplicationModule, InfraModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
