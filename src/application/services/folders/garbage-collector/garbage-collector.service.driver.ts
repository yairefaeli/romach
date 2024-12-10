import { RegisteredFolderRepositoryTestkit } from '../../../interfaces/registered-folders-repository/registered-folder-repository.interface.testkit';
import { AppLoggerServiceTestkit } from '../../../../infra/logging/app-logger.service.testkit';
import { RegisteredFolder } from '../../../../domain/entities/RegisteredFolder';
import { GarbageCollectorService } from './garbage-collector.service';
import { chance } from '../../../../utils/Chance/chance';
import { Result } from 'rich-domain';

jest.useFakeTimers();

jest.spyOn(global, 'setTimeout');

export class GarbageCollectorServiceDriver {
    private loggerTestkit = AppLoggerServiceTestkit();
    private gcInterval = chance.integer({ min: 1, max: 10 });
    private registeredFolderRepositoryTestkit = RegisteredFolderRepositoryTestkit();
    given = {
        getExpiredRegisteredFolders: (result: Result<RegisteredFolder[]>): this => {
            this.registeredFolderRepositoryTestkit.mockGetExpiredRegisteredFolders(result);
            return this;
        },
        deleteRegisteredFoldersByIds: (result: Result): this => {
            this.registeredFolderRepositoryTestkit.mockDeleteRegisteredFoldersByIds(result);
            return this;
        },
    };
    private garbageCollectorService: GarbageCollectorService;
    get = {
        gcInterval: () => this.gcInterval,
        logger: () => this.loggerTestkit.appLoggerService(),
        garbageCollectionFunction: () => this.garbageCollectorService['performGarbageCollection'],
        registeredFoldersRepository: () => this.registeredFolderRepositoryTestkit.registeredFolderRepository(),
    };
    when = {
        execute: () => {
            this.garbageCollectorService = new GarbageCollectorService({
                logger: this.get.logger(),
                gcInterval: this.get.gcInterval(),
                maxRetry: chance.integer({ min: 1, max: 10 }),
                registeredFolderRepositoryInterface: this.get.registeredFoldersRepository(),
            });
        },
    };
}
