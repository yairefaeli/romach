import { RomachApiRestClientService } from '../romach-api-rest-client/romach-api-rest-client.service';
import { AppConfigService } from '../../config/app-config/app-config.service';
import { LoginResponse } from '../../../application/entities/login-response';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Injectable } from '@nestjs/common';

export interface RomachLoginApiRequestBody {
    clientId: string;
    clientSecret: string;
}

@Injectable()
export class RomachLoginApiClientService {
    private config = this.appConfigService.get().romach.loginApi;

    constructor(
        private logger: AppLoggerService,
        private readonly appConfigService: AppConfigService,
        private client: RomachApiRestClientService<RomachLoginApiRequestBody, LoginResponse>,
    ) {}

    public async login(): Promise<LoginResponse> {
        this.logger.info(`Logging in to ${this.config.url}...`);
        return this.client.post({
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
        });
    }
}
