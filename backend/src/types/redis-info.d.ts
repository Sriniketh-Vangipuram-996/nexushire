declare module "redis-info" {
  interface RedisInfo {
    redis_mode: string;
  }

  const value: RedisInfo;
  export = value;
}