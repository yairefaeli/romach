import { RegisteredFolderRepositoryInterface as RegisteredFolderRepositoryInterface } from 'src/application/interfaces/registered-folders-repository/registered-folder-repository.interface';
import { InjectRegisteredFoldersRepository } from '../../../infra/romach-repository/romach-repository.module';
import { Result } from 'rich-domain';

export interface GetUserRegisteredFoldersUseCaseInput {
    upn: string;
}

export interface GetUserRegisteredFoldersUseCaseOutput {
    ids: string[];
}

export class GetUserRegisteredFoldersUseCaseService {
    constructor(
        @InjectRegisteredFoldersRepository()
        private registeredFolderRepository: RegisteredFolderRepositoryInterface,
    ) {}

    async execute(input: GetUserRegisteredFoldersUseCaseInput): Promise<Result<GetUserRegisteredFoldersUseCaseOutput>> {
        const { upn } = input;
        const result = await this.registeredFolderRepository.getRegisteredFoldersByUpn(upn);
        if (result.isFail()) {
            return Result.fail(result.error());
        }

        const ids = result.value().map((folder) => folder.getProps().folderId);

        return Result.Ok({ ids });
    }
}
