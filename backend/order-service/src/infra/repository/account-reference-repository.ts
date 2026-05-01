import { DatabaseConnection } from "../../application/database/database-connection";
import { inject } from "../utils/registry";

export interface AccountReferenceRepository {
  save(accountId: string): Promise<void>;
  exist(accountId: string): Promise<boolean>;
  clear(): Promise<void>;
}

export class AccountReferenceRepositoryDatabase implements AccountReferenceRepository {
  @inject("databaseConnection")
  private readonly connection!: DatabaseConnection;

  async save(accountId: string) {
    await this.connection.query(
      "insert into ccca.account (account_id) values ($1)",
      [accountId],
    );
  }

  async exist(accountId: string) {
    const [result] = await this.connection.query(
      "select 1 from ccca.account where account_id = $1",
      [accountId],
    );
    return !!result;
  }

  async clear() {
    await this.connection.query("delete from ccca.account", []);
  }
}
