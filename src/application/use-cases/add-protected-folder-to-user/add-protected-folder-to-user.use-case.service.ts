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
    const checkPasswordResult = await this.api.checkPassword(folderId, password);

    if (checkPasswordResult.isFail()) {
      Result.fail(checkPasswordResult.error());
    }

    const isPasswordCorrect = checkPasswordResult.value();

    if (!isPasswordCorrect) {
      Result.fail('wrong-password');
    }

    const folderResult = await this.api.getFolderByIdWithPassword(folderId, password);

    if (folderResult.isFail()) {
      return Result.fail('not-found');
    }

    const folder = folderResult.value();
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


/*
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    
    #PSUDO:
     - user requested new folder (upn, id, password)
            select basicFolder from repo by folderId
            on sucess
                if passwordProtected
                    check with API by password and folderId
                    on sucess
                        on right password
                            fetch folder from API with id and password
                            get current registeredFolders from repo by folderId, password
                            create registeredFolder with status 'valid' - on create fail 'error'
                            update current registeredFolders status and folder
                            upsert all registeredFolders to repo 
                        on wrong password
                            get current registeredFolders from repo by folderId, password
                            create registeredFolder with status 'wrong-password'
                            update current registeredFolders status
                            upsert all registeredFolders to repo 
                    on fail
                        get current registeredFolders from repo by folderId
                        create new registeredFolder with status 'error'
                        update current registeredFolders status
                        upsert all registeredFolders to repo 
                if not passwordProtected
                    fetch folder from API with id
                    get current registeredFolders from repo by folderId
                    create new registeredFolder with status 'valid' - on create fail 'error'
                    update current registeredFolders status and folder
                    upsert all registeredFolders to repo 
            on failed
                create registeredFolder with status 'error'
                insert registeredFolder to repo
                


            updateregisteredFolders(upn, id, password, status, folder):
                get current registeredFolders from repo by folderId
                create new registeredFolder with status 'status'
                update current registeredFolders status 'status' and folder
                upsert all registeredFolders to repo 
    */
