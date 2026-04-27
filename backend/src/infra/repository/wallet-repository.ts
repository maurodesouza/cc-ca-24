import { Wallet } from "../../domain/wallet";
import { Balance } from "../../domain/balance";
import { DatabaseConnection } from "../../application/database/database-connection";
import { inject } from "../di/registry";
import { ORM } from "../orm/orm";
import { BalanceModel } from "../orm/models/balance-model";

export interface WalletRepository {
  save(wallet: Wallet): Promise<void>;
  update(wallet: Wallet): Promise<void>;
  getByAccountId(accountId: string): Promise<Wallet>;
}
export class WalletRepositoryORM implements WalletRepository {
  @inject("orm")
  private readonly orm!: ORM;

  async save(wallet: Wallet): Promise<void> {
    const balances = BalanceModel.fromEntity(wallet)

    for (const balance of balances) {
      await this.orm.save(balance)
    }
  }

  async update(wallet: Wallet): Promise<void> {
    await this.orm.deleteMany(BalanceModel, { where: { account_id: wallet.getAccountId() } });
    await this.save(wallet);
  }

  async getByAccountId(accountId: string): Promise<Wallet> {
    const balancesModels = await this.orm.findMany(BalanceModel, { where: { account_id: accountId } });
    const balances = balancesModels.map((balancesModel) => balancesModel.toEntity());
    return new Wallet(accountId, balances);
  }
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
