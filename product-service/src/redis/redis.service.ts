import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  async set(key: string, value: string, ttl: number) {
    await this.client.set(key, value, 'EX', ttl);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async delByPattern(pattern: string) {
    const stream = this.client.scanStream({
      match: pattern,
    });

    for await (const keys of stream) {
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    }
  }

  async flushall() {
    await this.client.flushall();
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
