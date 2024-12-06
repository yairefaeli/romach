import { GetUserRegisteredFoldersUseCaseFactoryService } from './use-cases/get-user-registered-folders-use-case/get-user-registered-folders-use-case-factory.service';
import { RegisterFoldersForUserUseCase } from './use-cases/register-folders-for-user/register-folders-for-user.use-case.service';
import { HierarchyReplicationService } from './use-cases/hierarchy-replication/hierarchy-replication.service';
import { InfraModule } from '../infra/infra.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [InfraModule],
    providers: [
        HierarchyReplicationService,
        GetUserRegisteredFoldersUseCaseFactoryService,
        RegisterFoldersForUserUseCase,
    ],
})
export class ApplicationModule {}
