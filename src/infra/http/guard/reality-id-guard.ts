import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config/app-config.service';

@Injectable()
export class RealityIdGuard implements CanActivate {
    constructor(private config: AppConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const realityId = this.extractRealityId(request);
        if (!realityId) {
            throw new BadRequestException('reality-id header is required');
        }

        if (!this.config.get().romach.realities.includes(realityId)) {
            throw new BadRequestException('Invalid reality-id');
        }

        return true;
    }

    private extractRealityId(request: any): string | null {
        const realityId = request.headers['reality-id'];
        if (!realityId) return null;
        return realityId;
    }
}
