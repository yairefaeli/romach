import { AppLoggerService } from './app-logger.service';

export const AppLoggerServiceTestkit = () => {
    const appLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    } as unknown as AppLoggerService;

    return { appLoggerService: () => appLoggerService };
};
