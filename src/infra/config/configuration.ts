
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
}

export interface RomachRefetchFoldersConfig {
  pollInterval: number;
  chunkSize: number;
}

export interface GarbageCollectorConfig {
  maxRetry: number;
  gcInterval: number;
}

export interface RomachConfig {
  realities: string[];
  hierarchy: RomachHierarchyConfig;
  refetchFolders: RomachRefetchFoldersConfig;
  entitiesApi: RomachEntitiesApiConfig;
  loginApi: RomachLoginApiConfig;
  refreshTokenApi: RomachRefreshTokenApiConfig;
  basicFolder: RomachBasicFolderConfig;
  garbageCollector: GarbageCollectorConfig;
}
