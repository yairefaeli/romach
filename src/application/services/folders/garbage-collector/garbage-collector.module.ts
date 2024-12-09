import { RegisteredFoldersRepositoryModule } from '../../../../infra/romach-repository/registered-folders/registered-folders-repository.module';
import { GarbageCollectorFactory } from './garbage-collector.factory';
import { Module } from '@nestjs/common';

@Module({
    imports: [RegisteredFoldersRepositoryModule],
    providers: [GarbageCollectorFactory],
    exports: [GarbageCollectorFactory],
})
export class GarbageCollectorModule {}
