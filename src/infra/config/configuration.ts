export interface Configuration {
    logger: {
        level: string;
        name: string;
    };
    database: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
        schema: string;
        pool: {
            min: number;
            max: number;
        };
        logging: {
            logEverySql: boolean;
            includeBindings: boolean;
        };
    };
    server: {
        port: number;
    };
    jwt: {
        secret: string;
    };
    romach: RomachConfig;
}

export interface RomachHierarchyConfig {
    pollInterval: number;
}

export interface RomachEntitiesApiConfig {
    url: string;
    timeout: number;
}

export interface RomachLoginApiConfig {
    url: string;
    clientId: string;
    clientSecret: string;
    timeout: number;
    interval: number;
}

export interface RomachRefreshTokenApiConfig {
    url: string;
    timeout: number;
    interval: number;
}

export interface RomachBasicFolderConfig {
    pollInterval: number;
    maxRetry: number;
    retryInterval;
}

export interface RegisteredFolderConfig {
    maxRetry: number;
}

export interface GarbageCollectorConfig {
    maxRetry: number;
    gcInterval: number;
}

export interface AddProtectedFolderToUserUseCaseConfig {
    maxRetry: number;
    gcInterval: number;
}

export interface RetryIntervalConfig {
    maxRetry: number;
    retryInterval: number;
}

export interface RomachConfig {
    realities: string[];
    hierarchy: RomachHierarchyConfig;
    entitiesApi: RomachEntitiesApiConfig;
    loginApi: RomachLoginApiConfig;
    refreshTokenApi: RomachRefreshTokenApiConfig;
    basicFolder: RomachBasicFolderConfig;
    garbageCollectorConfig: GarbageCollectorConfig;
    addProtectedFolderToUserUseCaseConfig: AddProtectedFolderToUserUseCaseConfig;
    registeredFolderConfig: RegisteredFolderConfig;
    retryIntervalConfig: RetryIntervalConfig;
}
