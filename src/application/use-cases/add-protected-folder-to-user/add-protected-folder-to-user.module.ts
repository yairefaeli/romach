import { AddProtectedFolderToUserUseCaseService } from './add-protected-folder-to-user.use-case.service';
import { LoggingModule } from '../../../infra/logging/logging.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [LoggingModule],
    providers: [AddProtectedFolderToUserUseCaseService],
    exports: [AddProtectedFolderToUserUseCaseService],
})
export class AddProtectedFolderToUserModule {}
