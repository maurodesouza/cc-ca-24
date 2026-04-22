import pgPromise from "pg-promise";

export interface AccountDAO {
  save(account: any): Promise<void>;
  getById(accountId: string): Promise<any>;
}

export class AccountDAODatabase implements AccountDAO {
  async save(account: any): Promise<void> {
    const connection = pgPromise()("postgres://postgres:postgres@localhost:6543/app");

    await connection.query("insert into ccca.account (account_id, name, email, password, document) values ($1, $2, $3, $4, $5)", [account.accountId, account.name, account.email, account.password, account.document]);

    connection.$pool.end();
  }

  async getById(accountId: string): Promise<any> {
    const connection = pgPromise()("postgres://postgres:postgres@localhost:6543/app");
    const [account] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);

    connection.$pool.end();

    return account;
  }
}

export class AccountDAOInMemory implements AccountDAO {
  accounts: Record<string, any> = {};

  async save(account: any): Promise<void> {
    this.accounts[account.accountId] = account;
  }

  async getById(accountId: string): Promise<any> {
    return this.accounts[accountId];
  }
}
