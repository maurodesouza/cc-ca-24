import { Account } from "./account";
import { Balance } from "./balance";
import { DatabaseConnection } from "./database-connection";

export interface AccountRepository {
  save(account: Account): Promise<void>;
  update(account: Account): Promise<void>;
  getById(accountId: string): Promise<Account>;
}

export class AccountRepositoryDatabase implements AccountRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(account: Account): Promise<void> {
    await this.connection.query("insert into ccca.account (account_id, name, email, password, document) values ($1, $2, $3, $4, $5)", [account.accountId, account.name, account.email, account.password, account.document]);
  }

  async update(account: Account): Promise<void> {
    await this.connection.query("update ccca.account set name = $1, email = $2, password = $3, document = $4 where account_id = $5", [account.name, account.email, account.password, account.document, account.accountId]);

    for (const movement of account.newMovements) {
      await this.connection.query(
        "insert into ccca.fund (fund_id, account_id, asset_id, quantity) values ($1, $2, $3, $4)",
        [movement.fundId, account.accountId, movement.assetId, movement.quantity]
      );
    }
  }

  async getById(accountId: string): Promise<Account> {
    const [accountRaw] = await this.connection.query("select * from ccca.account where account_id = $1", [accountId]);
    if (!accountRaw) throw new Error("Account not found");

    const balancesRaw = await this.connection.query("select * from ccca.fund where account_id = $1", [accountId]);
    const balances = balancesRaw.map((balance: any) => new Balance(balance.fund_id, balance.asset_id, parseFloat(balance.quantity)));

    return new Account(accountRaw.account_id, accountRaw.name, accountRaw.email, accountRaw.password, accountRaw.document, balances);
  }
}

export class AccountRepositoryInMemory implements AccountRepository {
  accounts: Record<string, any> = {};

  async save(account: any): Promise<void> {
    this.accounts[account.accountId] = account;
  }

  async update(account: any): Promise<void> {
    this.accounts[account.accountId] = account;
  }

  async getById(accountId: string): Promise<any> {
    return this.accounts[accountId];
  }
}
