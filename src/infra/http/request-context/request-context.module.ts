import { Module, Provider, Scope } from '@nestjs/common';
import { RequestContext } from './request-context';

const RequestContextProvider: Provider = { provide: RequestContext, useClass: RequestContext, scope: Scope.REQUEST };

@Module({
    providers: [RequestContextProvider],
    exports: [RequestContextProvider],
})
export class RequestContextModule {}
