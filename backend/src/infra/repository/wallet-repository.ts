import { Wallet } from "../../domain/wallet";
import { Balance } from "../../domain/balance";
import { DatabaseConnection } from "../../application/database/database-connection";
import { inject } from "../di/registry";

export interface WalletRepository {
  save(wallet: Wallet): Promise<void>;
  update(wallet: Wallet): Promise<void>;
  getByAccountId(accountId: string): Promise<Wallet>;
}

export class WalletRepositoryDatabase implements WalletRepository {
  @inject("databaseConnection")
  private readonly connection!: DatabaseConnection;

  async save(wallet: Wallet): Promise<void> {
    for (const balance of wallet.balances) {
      await this.connection.query("insert into ccca.balance (account_id, asset_id, quantity, blocked_quantity) values ($1, $2, $3, $4)", [wallet.getAccountId(), balance.getAssetId(), balance.getQuantity(), balance.getBlockedQuantity()]);
    }
  }

  async update(wallet: Wallet): Promise<void> {
    await this.connection.query("delete from ccca.balance where account_id = $1", [wallet.getAccountId()]);

    for (const balance of wallet.balances) {
      await this.connection.query("insert into ccca.balance (account_id, asset_id, quantity, blocked_quantity) values ($1, $2, $3, $4)", [wallet.getAccountId(), balance.getAssetId(), balance.getQuantity(), balance.getBlockedQuantity()]);
    }
  }

  async getByAccountId(accountId: string): Promise<Wallet> {
    const balancesData = await this.connection.query("select * from ccca.balance where account_id = $1", [accountId]);
    const balances = balancesData.map((balanceData: any) => (new Balance(balanceData.asset_id, parseFloat(balanceData.quantity), parseFloat(balanceData.blocked_quantity || 0))));
    return new Wallet(accountId, balances);
  }
}
