import { RegisteredFolderRepositoryInterface as RegisteredFoldersRepositoryInterface } from 'src/application/interfaces/registered-folders-repository/registered-folder-repository.interface';
import { Result } from 'rich-domain';

export interface GetUserRegisteredFoldersUseCaseInput {
    upn: string;
}

export interface GetUserRegisteredFoldersUseCaseOutput {
    ids: string[];
}

export class GetUserRegisteredFoldersUseCase {
    constructor(private RegisteredFoldersRepositoryInterface: RegisteredFoldersRepositoryInterface) {}

    async execute(input: GetUserRegisteredFoldersUseCaseInput): Promise<Result<GetUserRegisteredFoldersUseCaseOutput>> {
        const { upn } = input;
        const result = await this.RegisteredFoldersRepositoryInterface.getRegisteredFoldersByUpn(upn);
        if (result.isFail()) {
            return Result.fail(result.error());
        }

        const ids = result.value().map((folder) => folder.getProps().folderId);

        return Result.Ok({ ids });
    }
}
