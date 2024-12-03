import { RegisteredFolderRepositoryTestkit } from '../../../interfaces/registered-folders-repository/registered-folder-repository.interface.testkit';
import { RomachEntitiesApiTestkit } from '../../../interfaces/romach-entites-api/romach-entities-api.interface.testkit';
import { AppLoggerServiceTestkit } from '../../../../infra/logging/app-logger.service.testkit';
import { RegisteredFolder } from '../../../../domain/entities/RegisteredFolder';
import { RetryFailedStatusService } from './retry-failed-status.service';
import { chance } from '../../../../utils/Chance/chance';
import { Result } from 'rich-domain';

export class RetryFailedStatusServiceDriver {
    private loggerTestkit = AppLoggerServiceTestkit();
    private registeredFolderRepositoryTestkit = RegisteredFolderRepositoryTestkit();
    private romachEntitiesApiTestkit = RomachEntitiesApiTestkit();
    private retryFailedStatusService: RetryFailedStatusService;

    given = {
        mockFetchFailedFolders: (result: Result<RegisteredFolder[]>): this => {
            this.registeredFolderRepositoryTestkit.mockGetRegisteredFoldersWithFailedStatuses(result);
            return this;
        },

        mockRetryFetchFolderByIdAndPassword: (result: Result<RegisteredFolder[]>): this => {
            this.registeredFolderRepositoryTestkit.mockGetRegisteredFoldersByIdAndPassword(result);
            return this;
        },
        mockUpsertRegisteredFolders: (result: Result<void>): this => {
            this.registeredFolderRepositoryTestkit.mockUpsertRegisteredFolders(result);
            return this;
        },
        mockDeleteRegisteredFoldersByIds: (result: Result<void>): this => {
            this.registeredFolderRepositoryTestkit.mockDeleteRegisteredFoldersByIds(result);
            return this;
        },
    };

    when = {
        execute: async (): Promise<Result<void>> => {
            this.retryFailedStatusService = new RetryFailedStatusService({
                logger: this.loggerTestkit.appLoggerService(),
                registeredFolderRepositoryInterface:
                    this.registeredFolderRepositoryTestkit.registeredFolderRepository(),
                maxRetry: chance.integer({ min: 1, max: 10 }),
                retryInterval: chance.integer({ min: 1, max: 10 }),
                romachEntitiesApi: this.romachEntitiesApiTestkit.romachEntitiesApiInterface(),
            });

            return await this.retryFailedStatusService.retryFailedStatus();
        },
    };

    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
    };
}
