import { RegisteredFolderErrorStatus } from '../../../domain/entities/RegisteredFolderStatus';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { RegisteredFolder } from '../../../domain/entities/RegisteredFolder';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Folder } from '../../../domain/entities/Folder';
import { Result } from 'rich-domain';

export interface AddProtectedFolderToUserInput {
  upn: string;
  password: string;
  folderId: string;
}

export class AddProtectedFolderToUserUseCase {
  constructor(
    private repo: RomachRepositoryInterface,
    private api: RomachEntitiesApiInterface,
  ) { }

  async execute(
    input: AddProtectedFolderToUserInput,
  ): Promise<Result<Folder, RegisteredFolderErrorStatus>> {
    const { upn, password, folderId } = input;
    const checkPasswordResult = await this.api.checkPassword(
      folderId,
      password
    );

    if (checkPasswordResult.isFail()) {
      return Result.fail(checkPasswordResult.error());
    }

    const folder = checkPasswordResult.value();
    const createValidRegisteredFolderResult =
      RegisteredFolder.createValidRegisteredFolder({
        folder,
        upn,
        lastValidPasswordTimestamp: Timestamp.now(),
        password,
      });

    if (createValidRegisteredFolderResult.isFail()) {
      return Result.fail('general-error');
    }

    const upsertRegisteredFoldersResult =
      await this.repo.upsertRegisteredFolders([
        createValidRegisteredFolderResult.value(),
      ]);

    if (upsertRegisteredFoldersResult.isFail()) {
      return Result.fail('general-error');
    }

    return Result.Ok(folder);
  }
}
