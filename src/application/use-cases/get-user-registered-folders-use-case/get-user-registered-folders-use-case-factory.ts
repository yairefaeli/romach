import { RegisteredFoldersRepositoryFactory } from '../../../infra/romach-repository/registered-folders/regsiterd-folders-repository-factory';
import { GetUserRegisteredFoldersUseCase } from './get-user-registered-folders-use-case.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetUserRegisteredFoldersUseCaseFactory {
    private perRealityMap: Map<RealityId, GetUserRegisteredFoldersUseCase>;

    constructor(private registeredFoldersRepositoryFactoryService: RegisteredFoldersRepositoryFactory) {
        this.perRealityMap = new Map<RealityId, GetUserRegisteredFoldersUseCase>();
    }

    create(reality: RealityId): GetUserRegisteredFoldersUseCase {
        if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);
        return new GetUserRegisteredFoldersUseCase(this.registeredFoldersRepositoryFactoryService.create(reality));
    }
}
