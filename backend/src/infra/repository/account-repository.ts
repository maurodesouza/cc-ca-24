import { Account } from "../../domain/account";
import { DatabaseConnection } from "../../application/database/database-connection";

export interface AccountRepository {
  save(account: Account): Promise<void>;
  update(account: Account): Promise<void>;
  getById(accountId: string): Promise<Account>;
}

export class AccountRepositoryDatabase implements AccountRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(account: Account): Promise<void> {
    await this.connection.query("insert into ccca.account (account_id, name, email, password, document) values ($1, $2, $3, $4, $5)", [account.getAccountId(), account.getName(), account.getEmail(), account.getPassword(), account.getDocument()]);
  }

  async update(account: Account): Promise<void> {
    await this.connection.query("update ccca.account set name = $1, email = $2, password = $3, document = $4 where account_id = $5", [account.getName(), account.getEmail(), account.getPassword(), account.getDocument(), account.getAccountId()]);
  }

  async getById(accountId: string): Promise<Account> {
    const [accountRaw] = await this.connection.query("select * from ccca.account where account_id = $1", [accountId]);
    if (!accountRaw) throw new Error("Account not found");
    return new Account(accountRaw.account_id, accountRaw.name, accountRaw.email, accountRaw.password, accountRaw.document);
  }
}
