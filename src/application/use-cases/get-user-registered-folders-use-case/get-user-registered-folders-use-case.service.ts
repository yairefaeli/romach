import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { Result } from 'rich-domain';

export interface GetUserRegisteredFoldersUseCaseInput {
  upn: string;
}

export interface GetUserRegisteredFoldersUseCaseOutput {
  ids: string[];
}

export class GetUserRegisteredFoldersUseCase {
  constructor(private romachRepository: RomachRepositoryInterface) { }
  async execute(
    input: GetUserRegisteredFoldersUseCaseInput,
  ): Promise<Result<GetUserRegisteredFoldersUseCaseOutput>> {
    const { upn } = input;
    const result = await this.romachRepository.getRegisteredFoldersByUpn(upn);
    if (result.isFail()) {
      return Result.fail(result.error());
    }
    Result.Ok({ ids: result.value() });
  }
}
