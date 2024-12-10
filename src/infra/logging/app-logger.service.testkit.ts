import { AppLoggerService } from './app-logger.service';

jest.mock('./app-logger.service', () => ({
    AppLoggerService: jest.fn().mockImplementation(() => ({
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    })),
}));

export const AppLoggerServiceTestkit = () => {
    const appLoggerServiceMock = new AppLoggerService(null);

    return { appLoggerService: () => appLoggerServiceMock };
};
