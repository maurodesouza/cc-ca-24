import { Balance } from "../../../domain/balance";
import { Wallet } from "../../../domain/wallet";
import { column, model, Model } from "../orm";

@model("ccca", "balance")
export class BalanceModel extends Model {
  @column("account_id", true)
  accountId!: string
  @column("asset_id", true)
  assetId!: string
  @column("quantity")
  quantity!: number
  @column("blocked_quantity")
  blockedQuantity!: number

  constructor(
    accountId: string,
    assetId: string,
    quantity: number,
    blockedQuantity: number
  ) {
    super()
    this.accountId = accountId
    this.assetId = assetId
    this.quantity = quantity
    this.blockedQuantity = blockedQuantity
  }

  static fromEntity(wallet: Wallet) {
    return wallet.balances.map(balance => new BalanceModel(
      wallet.getAccountId(),
      balance.getAssetId(),
      balance.getQuantity(),
      balance.getBlockedQuantity()
    ))
  }

  toEntity() {
    return new Balance(
      this.assetId,
      parseFloat(String(this.quantity)),
      parseFloat(String(this.blockedQuantity))
    )
  }
}
