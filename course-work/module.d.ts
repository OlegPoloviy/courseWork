declare namespace NodeJS {
  export interface ProccessEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
  }
}
