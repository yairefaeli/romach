import { RomachApiRestClientService } from '../romach-api-rest-client/romach-api-rest-client.service';
import { LoginResponse } from '../../../application/entities/login-response';
import { Injectable } from '@nestjs/common';

export interface RomachRefreshTokenApiRequestBody {
    refreshToken: string;
}

@Injectable()
export class RomachRefreshTokenApiClientService {
    constructor(private client: RomachApiRestClientService<RomachRefreshTokenApiRequestBody, LoginResponse>) {}

    public async refresh(refreshToken: string): Promise<LoginResponse> {
        return this.client.post({
            refreshToken,
        });
    }
}
