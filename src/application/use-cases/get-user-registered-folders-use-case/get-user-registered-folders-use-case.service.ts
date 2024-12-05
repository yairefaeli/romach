import { RegisteredFolderRepositoryInterface as RegisteredFolderRepositoryInterface } from 'src/application/interfaces/registered-folders-repository/registered-folder-repository.interface';
import { Result } from 'rich-domain';

export interface GetUserRegisteredFoldersUseCaseInput {
    upn: string;
}

export interface GetUserRegisteredFoldersUseCaseOutput {
    ids: string[];
}

export class GetUserRegisteredFoldersUseCase {
    constructor(private RegisteredFolderRepositoryInterface: RegisteredFolderRepositoryInterface) {}

    async execute(input: GetUserRegisteredFoldersUseCaseInput): Promise<Result<GetUserRegisteredFoldersUseCaseOutput>> {
        const { upn } = input;
        const result = await this.RegisteredFolderRepositoryInterface.getRegisteredFoldersByUpn(upn);
        if (result.isFail()) {
            return Result.fail(result.error());
        }

        const ids = result.value().map((folder) => folder.getProps().folderId);

        return Result.Ok({ ids });
    }
}
