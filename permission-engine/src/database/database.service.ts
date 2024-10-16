import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Logger } from '../lib/logger/logger.service';
import { readdir, readFile } from 'node:fs/promises';
import * as path from 'path';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.pool = new Pool(this.configService.get<DatabaseConfig>('database'));
  }

  async onModuleInit() {
    await this.createSchema();
  }

  async _runSQLQueryByName(name: string): Promise<void> {
    let queryPath = path.join(__dirname, `sql/${name}.sql`);

    if (process.env.NODE_ENV === 'dev') {
      queryPath = `/app/src/database/sql/${name}.sql`;
    }

    const querySQL = await readFile(queryPath, 'utf-8');
    try {
      await this.pool.query(querySQL);
      this.logger.log(`Database schema.${name} applied successfully.`);
    } catch (error) {
      this.logger.error(`Error applying schema.${name}:`, error);
    }
  }

  async _runMigrations(): Promise<void> {
    let migrationDir = path.join(__dirname, `sql/migrations`);

    if (process.env.NODE_ENV === 'dev') {
      migrationDir = `/app/src/database/sql/migrations`;
    }
    const migrationFileNames = await readdir(migrationDir).then((files) => {
      return files.filter((file) => path.extname(file) === '.sql');
    });

    const pastMigrationNames = await this.pool.query(
      `SELECT name FROM "migration" WHERE is_successful = true;`,
    );

    for (const migrationFileName of migrationFileNames.sort((a, b) => {
      const timestampA = parseInt(a.split('_')[0], 10);
      const timestampB = parseInt(b.split('_')[0], 10);
      return timestampA - timestampB;
    })) {
      if (
        !pastMigrationNames.rows
          .map((item) => item.name)
          .includes(migrationFileName)
      ) {
        await this._runSQLQueryByName(
          `migrations/${migrationFileName.split('.')[0]}`,
        )
          .then(async () => {
            await this.pool.query(
              `INSERT INTO "migration" (id, name, is_successful) VALUES (uuid_generate_v4(), $1, TRUE)`,
              [migrationFileName],
            );
          })
          .catch(async (error) => {
            await this.pool.query(
              `INSERT INTO "migration" (id, name, is_successful, error_message) VALUES (uuid_generate_v4(), $1, FALSE, $2)`,
              [migrationFileName, error.message],
            );
          });
      }
    }
  }

  async createSchema(): Promise<void> {
    // extensions
    await this._runSQLQueryByName('extensions');
    // types
    await this._runSQLQueryByName('types');
    // tables
    await this._runSQLQueryByName('tables');
    // indexes
    await this._runSQLQueryByName('indexes');
    // migrations
    await this._runMigrations();
    // mockup data for dev environment
    if (process.env.NODE_ENV === 'dev') {
      try {
        const testUser = await this.pool.query(`SELECT * FROM "user";`);
        const mockUpData = await this.pool.query(
          `SELECT * FROM "space_event" WHERE name = 'test-space-event-1';`,
        );

        if (testUser.rows.length > 0 && mockUpData.rows.length === 0) {
          await this._runSQLQueryByName('/test/insert-mockup-data');
        }
      } catch (error) {
        this.logger.error('Failed to insert mock up data', error);
      }
    }
  }
}
