import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerMetadata } from './logger';
import { Logger } from 'winston';

@Injectable()
export class AppLoggerService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}

    error(message: string, meta?: any) {
        this.log(this.logger.error, message, meta);
    }

    info(message: string, meta?: any) {
        this.log(this.logger.info, message, meta);
    }

    debug(message: string, meta?: any) {
        this.log(this.logger.debug, message, meta);
    }

    createChild(metadata: LoggerMetadata) {
        const newMetadata = { ...this.logger.defaultMeta, ...metadata };
        const child = this.logger.child({});
        child.defaultMeta = newMetadata;
        return child;
    }

    private log(fn: (message: any, obj: any) => Logger, message: string, meta?: any) {
        fn(message, meta);
    }
}
