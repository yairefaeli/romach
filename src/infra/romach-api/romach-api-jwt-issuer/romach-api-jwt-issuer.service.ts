import { RomachRefreshTokenApiClientService } from '../romach-refresh-token-api-client/romach-refresh-token-api-client.service';
import { RomachLoginApiClientService } from '../romach-login-api-client/romach-login-api-client.service';
import { LoginResponse } from '../../../application/entities/login-response';
import { AppLoggerService } from '../../logging/app-logger.service';
import { FlowUtils } from '../../../utils/FlowUtils/FlowUtils';

export class RomachApiJwtIssuerService {
    private loginResponse: LoginResponse | undefined;
    private refreshTokenPeriodicallyHandler: NodeJS.Timeout | undefined;

    constructor(
        private loginInterval: number,
        private logger: AppLoggerService,
        private refreshTokenInterval: number,
        private romachLoginApiService: RomachLoginApiClientService,
        private romachRefreshTokenApiService: RomachRefreshTokenApiClientService,
    ) {
        this.loginResponse = undefined;
    }

    async init(): Promise<void> {
        this.logger.info('Initializing RomachApiJwtIssuerService');
        await this.loginUntilSuccess();
        this.refreshTokenPeriodically();
    }

    async getToken(): Promise<string | undefined> {
        return this.loginResponse?.tokenSet.accessToken;
    }

    stop(): void {
        clearInterval(this.refreshTokenPeriodicallyHandler);
        this.logger.info(`RomachApiJwtIssuerService stopped`);
    }

    private async loginUntilSuccess(): Promise<void> {
        while (!this.loginResponse) {
            try {
                this.loginResponse = await this.login();
                this.logger.info('Token generated successfully');
            } catch (error) {
                this.logger.error(`Failed to generate token ${error}`);
                await FlowUtils.delay(this.loginInterval);
            }
        }
    }

    private async login(): Promise<LoginResponse | undefined> {
        return this.romachLoginApiService.login();
    }

    private refreshTokenPeriodically(): void {
        this.refreshTokenPeriodicallyHandler = setInterval(async () => {
            try {
                this.loginResponse = await this.refreshToken();
            } catch (error) {
                this.logger.error(`Failed to refresh token ${error}`);
            }
        }, this.refreshTokenInterval);
    }

    private async refreshToken(): Promise<LoginResponse | undefined> {
        if (!this.loginResponse?.tokenSet?.refreshToken) {
            return undefined;
        }

        return this.romachRefreshTokenApiService.refresh(this.loginResponse.tokenSet.refreshToken);
    }
}
