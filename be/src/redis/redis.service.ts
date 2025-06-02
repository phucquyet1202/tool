// src/redis/redis.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async setLock(key: string, ttlSeconds: number): Promise<boolean> {
    // NX: only set if key does not exist
    const result = await this.client.set(key, 'locked', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.client.del(key);
  }

  async isLocked(key: string): Promise<boolean> {
    const result = await this.client.get(key);
    return result !== null;
  }
}
