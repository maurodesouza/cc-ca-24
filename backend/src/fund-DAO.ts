import pgPromise from "pg-promise";

export interface FundDAO {
  save(fund: any): Promise<void>;
  getById(fundId: string): Promise<any>;
  getBalance(accountId: string, assetId: string): Promise<number>;
}

export class FundDAODatabase implements FundDAO {
  async save(fund: any): Promise<void> {
    const connection = pgPromise()("postgres://postgres:postgres@localhost:6543/app");

    await connection.query("insert into ccca.fund (fund_id, account_id, asset_id, quantity) values ($1, $2, $3, $4)", [fund.fundId, fund.accountId, fund.assetId, fund.quantity]);

    connection.$pool.end();
  }

  async getById(fundId: string): Promise<any> {
    const connection = pgPromise()("postgres://postgres:postgres@localhost:6543/app");

    const [fund] = await connection.query("select fund_id, account_id, asset_id, quantity::double precision as quantity from ccca.fund where fund_id = $1", [fundId]);

    connection.$pool.end();

    return fund;
  }

  async getBalance(accountId: string, assetId: string): Promise<number> {
    const connection = pgPromise()("postgres://postgres:postgres@localhost:6543/app");
    const [balance] = await connection.query("select sum(quantity)::double precision as balance from ccca.fund where account_id = $1 and asset_id = $2", [accountId, assetId]);

    connection.$pool.end();

    return balance.balance;
  }
}

export class FundDAOInMemory implements FundDAO {
  funds: Record<string, any> = {};

  async save(fund: any): Promise<void> {
    this.funds[fund.fundId] = fund;
  }

  async getById(fundId: string): Promise<any> {
    return this.funds[fundId];
  }

  async getBalance(accountId: string, assetId: string): Promise<number> {
    const funds = Object.values(this.funds)
    const accountFunds = funds.filter((f) => f.accountId === accountId && f.assetId === assetId)


    return accountFunds.reduce((acc, fund) => acc + fund.quantity, 0)
  }
}
