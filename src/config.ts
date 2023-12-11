import * as process from 'process';

export default {
  OWNER_TG_ID: process.env.OWNER_TG_ID,
  CACHED_TIME_MS: process.env.CACHED_TIME_MS ?? 12 * 60 * 60 * 1000,
  PORT: process.env.PORT ?? 3030,
};
