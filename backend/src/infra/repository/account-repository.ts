import { Account } from "../../domain/account";
import { Balance } from "../../domain/balance";
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

    await this.connection.query("delete from ccca.balance where account_id = $1", [account.getAccountId()]);

    for (const balance of account.balances) {
      await this.connection.query("insert into ccca.balance (account_id, asset_id, quantity, blocked_quantity) values ($1, $2, $3, $4)", [account.getAccountId(), balance.getAssetId(), balance.getQuantity(), balance.getBlockedQuantity()]);
    }
  }

  async getById(accountId: string): Promise<Account> {
    const [accountRaw] = await this.connection.query("select * from ccca.account where account_id = $1", [accountId]);
    if (!accountRaw) throw new Error("Account not found");
    const balancesData = await this.connection.query("select * from ccca.balance where account_id = $1", [accountId]);
    const balances = balancesData.map((balanceData: any) => (new Balance(balanceData.asset_id, parseFloat(balanceData.quantity), parseFloat(balanceData.blocked_quantity || 0))));
    return new Account(accountRaw.account_id, accountRaw.name, accountRaw.email, accountRaw.password, accountRaw.document, balances);
  }
}
