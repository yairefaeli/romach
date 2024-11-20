import { RomachRepositoryFactoryService } from '../../../infra/romach-repository/romach-repository-factory.service';
import { RomachEntitiesApiFactoryService } from '../../../infra/romach-api/romach-entities-api/romach-entities-api-factory.service';
import { AddProtectedFolderToUserUseCase } from './add-protected-folder-to-user.use-case.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';

export interface AddProtectedFolderToUserInput {
  upn: string;
  password: string;
  folderId: string;
}

@Injectable()
export class AddProtectedFolderToUserUseCaseFactory {
  private perRealityMap: Map<RealityId, AddProtectedFolderToUserUseCase>;

  constructor(
    private repoFactory: RomachRepositoryFactoryService,
    private apiFactory: RomachEntitiesApiFactoryService,
  ) {
    this.perRealityMap = new Map<RealityId, AddProtectedFolderToUserUseCase>();
  }

  create(reality: RealityId): AddProtectedFolderToUserUseCase {
    if (this.perRealityMap.has(reality)) return this.perRealityMap.get(reality);

    const repo = this.repoFactory.create(reality);
    const api = this.apiFactory.create(reality);

    return new AddProtectedFolderToUserUseCase(repo, api);
  }
}
