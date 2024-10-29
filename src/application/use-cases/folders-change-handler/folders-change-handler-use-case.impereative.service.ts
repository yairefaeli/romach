import { Injectable } from '@nestjs/common';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { maxBy } from 'lodash';
import { Folder } from '../../../domain/entities/Folder';

export interface FolderChangeHandlerServiceOptions {
    interval: number;
    logger: AppLoggerService;
    romachApi: RomachEntitiesApiInterface;
    repository: RomachRepositoryInterface;
    leaderElection: LeaderElectionInterface;
}

@Injectable()
export class FolderChangeHandlerService {
    private timestamp: Timestamp;

    constructor(private options: FolderChangeHandlerServiceOptions) {
        this.timestamp = Timestamp.ts1970();
    }

    async execute() {
        this.options.logger.info('FolderChangeHandlerService has been initialized');

        const isLeader = await this.options.leaderElection.isLeader();
        if (isLeader) {
            this.options.logger.info('Leader detected, starting change handler process.');

            setInterval(async () => {
                try {
                    this.options.logger.debug('Polling for change handler');
                    await this.replicationProcess();
                } catch (error) {
                    this.options.logger.error(`Error during change handler: ${error.message}`);
                }
            }, this.options.interval);
        } else {
            this.options.logger.info('Not a leader, skipping change handler');
        }
    }

    private async replicationProcess() {
        try {
            const fetchedFolders = await this.fetchBasicFolders();

            const updatedOrNewFolders = await this.compareWithExistingFolders(fetchedFolders);

            if (updatedOrNewFolders.length > 0) {

                this.options.logger.info(`Handling ${updatedOrNewFolders.length} changed folders.`);
                this.updateTimestamp(updatedOrNewFolders);

                await this.saver(updatedOrNewFolders);

                await this.recalculateTree();
            } else {
                this.options.logger.info('No changed folders found.');
            }
        } catch (error) {
            this.options.logger.error(`Error during folder replication: ${error.message}`);
            throw error;
        }
    }

    private async fetchBasicFolders(): Promise<BasicFolder[]> {
        const folderResponse = await this.options.romachApi.getBasicFoldersByTimestamp(this.timestamp.toString());
        if (folderResponse.isFail()) {
            throw new Error(folderResponse.error());
        }
        this.options.logger.debug(`Fetched ${folderResponse.value().length} basic folders`);
        return folderResponse.value();
    }

    private async compareWithExistingFolders(fetchedFolders: BasicFolder[]): Promise<BasicFolder[]> {
        const repositoryResult = await this.options.repository.getFoldersByIds(fetchedFolders.map(folder => folder.getProps().id));

        if (repositoryResult.isFail()) {
            throw new Error(repositoryResult.error());
        }

        const existingFolders = repositoryResult.value().content as unknown as Folder[];
        const updatedOrNewFolders = fetchedFolders.filter(fetchedFolder =>
            this.isUpdatedOrNew(fetchedFolder, existingFolders)
        );

        this.options.logger.debug(`Found ${updatedOrNewFolders.length} changed folders`);
        return updatedOrNewFolders;
    }

    private isUpdatedOrNew(fetchedFolder: BasicFolder, existingFolders: Folder[]): boolean {
        const existingFolder = existingFolders.find(
            existing => existing.getProps().basicFolder.getProps().id === fetchedFolder.getProps().id
        );

        return !existingFolder || existingFolder.getProps().basicFolder.getProps().updatedAt < fetchedFolder.getProps().updatedAt;
    }

    private updateTimestamp(changedFolders: BasicFolder[]): void {
        const latestFolder = this.maxUpdatedAt(changedFolders);
        this.timestamp = Timestamp.fromString(latestFolder.getProps().updatedAt);
        this.options.logger.debug(`New timestamp: ${this.timestamp.toString()}`);
    }

    private async saver(changedFolders: BasicFolder[]): Promise<void> {
        try {
            await this.options.repository.saveBasicFolders(changedFolders);
            this.options.logger.info(`${changedFolders.length} changed folders saved to repository`);
        } catch (error) {
            this.options.logger.error(`Error saving folders: ${error.message}`);
            throw error;
        }
    }

    private async recalculateTree(): Promise<void> {
        try {
            this.options.logger.info('Triggering tree recalculation');
        } catch (error) {
            this.options.logger.error(`Error recalculating tree: ${error.message}`);
            throw error;
        }
    }

    private maxUpdatedAt(folders: BasicFolder[]): BasicFolder {
        return maxBy(folders, folder => Timestamp.fromString(folder.getProps().updatedAt).toNumber()) as BasicFolder;
    }
}
