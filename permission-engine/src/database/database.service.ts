import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Logger } from '../lib/logger/logger.service';
import * as fs from 'fs';
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

    const querySQL = fs.readFileSync(queryPath, 'utf-8');
    try {
      await this.pool.query(querySQL);
      this.logger.log(`Database schema.${name} applied successfully.`);
    } catch (error) {
      this.logger.error(`Error applying schema.${name}:`, error);
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
    await this._runSQLQueryByName(
      '/migrations/space-event-rule-id-drop-not-null',
    );
    await this._runSQLQueryByName(
      '/migrations/space-equipment-add-column-quantity',
    );
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
