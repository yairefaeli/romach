import { RealityId } from '../../../application/entities/reality-id';
import { RequestContext } from '../request-context/request-context';
import { NextFunction, Request, Response } from 'express';
import { NestMiddleware } from '@nestjs/common';

export class RealityIdMiddleware implements NestMiddleware {
    constructor(private readonly requestContext: RequestContext) {}

    use(req: Request, res: Response, next: NextFunction) {
        this.requestContext.realityId = req.headers.realityId as RealityId;
        next();
    }
}
