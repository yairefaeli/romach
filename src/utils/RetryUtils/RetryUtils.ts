import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { Result } from 'rich-domain';

export class RetryUtils {
    static async retry<T>(
        fn: () => Promise<Result<T>>,
        maxRetry: number,
        logger: AppLoggerService,
    ): Promise<Result<T>> {
        let retryCount = 0;
        while (retryCount < maxRetry) {
            const result = await fn();
            if (result.isOk()) {
                return result;
            } else {
                logger.error(`try #${retryCount} of ${maxRetry} failed with error: ${result.error()}`);
            }
            retryCount++;
        }
        return Result.fail('max retry reached');
    }
}
