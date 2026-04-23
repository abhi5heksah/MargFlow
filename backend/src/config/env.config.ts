import { Injectable, Module, Global } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly env: Record<string, string | undefined>;

  constructor() {
    this.env = process.env;
  }

  get(key: string): string | undefined {
    return this.env[key];
  }

  getRequired(key: string): string {
    const value = this.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  getInt(key: string, defaultValue?: number): number {
    const value = this.env[key];
    if (!value) return defaultValue ?? 0;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? (defaultValue ?? 0) : parsed;
  }

  getBool(key: string, defaultValue?: boolean): boolean {
    const value = this.env[key];
    if (!value) return defaultValue ?? false;
    return value.toLowerCase() === 'true';
  }
}

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}