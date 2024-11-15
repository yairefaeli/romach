import { RomachRepositoryInterface } from 'src/application/interfaces/romach-repository.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { RealityId } from '../../entities/reality-id';
import { Injectable } from '@nestjs/common';
import { partition } from 'lodash';

export interface RegisterFoldersForUserInput {
    reality: RealityId;
    upn: string;
    folderIds: string[];
}

@Injectable()
export class RegisterFoldersForUserUseCase {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly repository: RomachRepositoryInterface,
    ) {}
    async execute(dto: RegisterFoldersForUserInput): Promise<void> {
        /* 
        #PSUDO:
        - user mutation folders interval
                get registeredFolders from repo by UPN,folderId
                delete irrelevant registeredFolders
                update registration_timestamp on registeredFolders from repo by UPN,folderId
    */
        const { reality, upn, folderIds } = dto;
        const getRegisteredFoldersByUpnResult = await this.repository.getRegisteredFoldersByUpn(upn);
        const registeredFolders = getRegisteredFoldersByUpnResult.value();
        const [relevantregisteredFolders, irrelevantregisteredFolders] = partition(
            registeredFolders,
            (registeredFolder) => folderIds.includes(registeredFolder.getProps().folderId),
        );

        const irrelevantregisteredFoldersIds = irrelevantregisteredFolders.map(
            (registeredFolder) => registeredFolder.getProps().folderId,
        );
        const relevantregisteredFoldersIds = relevantregisteredFolders.map(
            (registeredFolder) => registeredFolder.getProps().folderId,
        );

        await this.repository.deleteRegisteredFoldersByIdsForUpn(irrelevantregisteredFoldersIds, upn);
        await this.repository.updateRegistrationByUpnAndFolderIds(relevantregisteredFoldersIds, upn);
    }
}
