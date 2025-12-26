import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value != null) return value;
  if (defaultValue != null) return defaultValue;
  throw new Error(`Environment variable ${key} is not set`);
}

export const CONFIG = {
  DATABASE: {
    type: 'postgres' as const,
    host: getEnv('DB_HOST'),
    port: parseInt(getEnv('DB_PORT', '5432')),
    username: getEnv('DB_USER'),
    password: getEnv('DB_PASS'),
    database: getEnv('DB_NAME'),
    // Note: in production we run compiled JS from /dist, so don't hardcode "/src"
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: false,
    ssl:
      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
};

if (process.env.NODE_ENV === 'development') {
  const logger = new Logger('Config');
  logger.log('Using configuration', CONFIG);
}
