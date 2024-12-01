import { RomachEntitiesApiTestkit } from '../../../interfaces/romach-entites-api/romach-entities-api.interface.testkit';
import { AppLoggerServiceTestkit } from '../../../../infra/logging/app-logger.service.testkit';
import { UpdateRegisteredFoldersService } from './update-registered-folders.service';

export class UpdateRegisteredFoldersServiceDriver {
    private loggerTestkit = AppLoggerServiceTestkit();
    private romachApiTestkit = RomachEntitiesApiTestkit();
    private a = Regis;
    private updateRegisteredFoldersService: UpdateRegisteredFoldersService;

    constructor() {
        this.updateRegisteredFoldersService = new UpdateRegisteredFoldersService({
            logger: this.get.logger(),
            romachApi: this.get.romachApi(),
            registeredFoldersService: null,
            registeredFolderRepositoryInterface: null,
        });
    }

    get = {
        logger: () => this.loggerTestkit.appLoggerService(),
        romachApi: () => this.romachApiTestkit.romachEntitiesApiInterface(),
    };
}
