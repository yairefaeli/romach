import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Configuration } from '../../config/configuration';
import { isNil } from 'lodash';
@Injectable()
export class AuthGuard implements CanActivate {
    jwtConfig: Configuration;
    constructor(
        private readonly jwtService: JwtService,
        private readonly logger: AppLoggerService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        if (isNil(token)) {
            this.logger.error('authorization header doesnt exist');
            throw new UnauthorizedException();
        }

        let payload;
        try {
            payload = await this.jwtService.verifyAsync(token, {
                secret: this.jwtConfig.jwt.secret,
            });
        } catch (error) {
            this.logger.error('jwt verification failed ' + error.message);
            throw new UnauthorizedException();
        }

        return !!payload['https://hasura.io/jwt/claims']['X-Hasura-Allowed-Roles'].includes('allowViewRomachEnemies');
    }

    private extractToken(request: any): string | null {
        const authHeader = request.headers['authorization'];
        if (!authHeader) return null;
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer') return null;
        return token;
    }
}
