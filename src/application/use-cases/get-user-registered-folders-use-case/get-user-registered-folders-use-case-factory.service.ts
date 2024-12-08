import { RegisteredFolderRepositoryInterface } from '../../interfaces/registered-folders-repository/registered-folder-repository.interface';
import { GetUserRegisteredFoldersUseCaseService } from './get-user-registered-folders-use-case.service';
import { RealityId } from '../../entities/reality-id';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetUserRegisteredFoldersUseCaseFactoryService {
    private perRealityMap: Map<RealityId, GetUserRegisteredFoldersUseCaseService>;

    constructor(
        @Inject('RegisteredFolderRepository')
        private registeredFolderRepositoryInterface: RegisteredFolderRepositoryInterface,
    ) {
        this.perRealityMap = new Map<RealityId, GetUserRegisteredFoldersUseCaseService>();
    }

    create(reality: RealityId): GetUserRegisteredFoldersUseCaseService {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
        return new GetUserRegisteredFoldersUseCaseService(this.registeredFolderRepositoryInterface);
    }
}
