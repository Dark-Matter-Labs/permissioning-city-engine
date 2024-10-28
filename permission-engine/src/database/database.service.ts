import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Logger } from '../lib/logger/logger.service';
import { readdir, readFile } from 'node:fs/promises';
import * as path from 'path';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private client: PoolClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.pool = new Pool(this.configService.get<DatabaseConfig>('database'));
  }

  async onModuleInit() {
    if (!this.client) {
      this.client = await this.pool.connect();
    }

    await this.createSchema();
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.release();
    }
  }

  private async runSQLQueryByName(name: string): Promise<void> {
    let queryPath = path.join(__dirname, `sql/${name}.sql`);

    if (process.env.NODE_ENV === 'dev') {
      queryPath = `/app/src/database/sql/${name}.sql`;
    }

    const querySQL = await readFile(queryPath, 'utf-8');
    try {
      await this.client.query('BEGIN');
      await this.client.query(querySQL);
      await this.client.query('COMMIT');
      this.logger.log(`Database schema.${name} applied successfully.`);
    } catch (error) {
      await this.client.query('ROLLBACK');
      this.logger.error(`Error applying schema.${name}:`, error);
    }
  }

  private async runMigrations(): Promise<void> {
    let migrationDir = path.join(__dirname, `sql/migrations`);

    if (process.env.NODE_ENV === 'dev') {
      migrationDir = `/app/src/database/sql/migrations`;
    }
    const migrationFiles = await readdir(migrationDir).then((files) => {
      return files.filter((file) => path.extname(file) === '.sql');
    });

    const pastMigrations = await this.client.query(
      `SELECT name FROM "migration" WHERE is_successful = true;`,
    );
    const pastMigrationNames = pastMigrations.rows.map((item) => item.name);
    const pendingMigrationNames = migrationFiles.filter(
      (item) => !pastMigrationNames.includes(item),
    );

    for (const migrationName of pendingMigrationNames.sort((a, b) => {
      const timestampA = parseInt(a.split('_')[0], 10);
      const timestampB = parseInt(b.split('_')[0], 10);
      return timestampA - timestampB;
    })) {
      try {
        await this.client.query('BEGIN');
        await this.runSQLQueryByName(
          `migrations/${migrationName.split('.')[0]}`,
        ).then(async () => {
          await this.client.query(
            `INSERT INTO "migration" (id, name, is_successful) VALUES (uuid_generate_v4(), $1, TRUE)`,
            [migrationName],
          );
        });
        await this.client.query('COMMIT');
      } catch (error) {
        await this.client.query('ROLLBACK');
        if (
          !error.message.startsWith(
            'duplicate key value violates unique constraint "migration_unique_name_is_successful"',
          )
        ) {
          await this.client.query(
            `INSERT INTO "migration" (id, name, is_successful, error_message) VALUES (uuid_generate_v4(), $1, FALSE, $2)`,
            [migrationName, error.message],
          );
        }
      }
    }
  }

  async createSchema(): Promise<void> {
    try {
      // extensions
      await this.runSQLQueryByName('extensions');
      // types
      await this.runSQLQueryByName('types');
      // tables
      await this.runSQLQueryByName('tables');
      // indexes
      await this.runSQLQueryByName('indexes');
      // migrations
      await this.runMigrations();
    } catch (error) {
      this.logger.error('Failed to create schema', error);
    }
  }
}
