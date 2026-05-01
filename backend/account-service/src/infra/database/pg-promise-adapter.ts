import { DatabaseConnection } from "../../application/database/database-connection";
import pgPromise from "pg-promise";

export class PGPromiseAdapter implements DatabaseConnection {
  private connection: any;

  constructor() {
    this.connection = pgPromise()("postgres://postgres:postgres@localhost:6542/app");
  }

  async query(query: string, params: any[]): Promise<any[]> {
    return this.connection.query(query, params);
  }

  async close(): Promise<void> {
    await this.connection.$pool.end();
  }
}
