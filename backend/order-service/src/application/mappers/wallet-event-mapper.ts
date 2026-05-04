import { Wallet } from "../../domain/wallet";

export class WalletEventMapper {
  static toPayload(wallet: Wallet) {
    return {
      accountId: wallet.getAccountId(),
      balances: wallet.balances.map(balance => ({
        assetId: balance.getAssetId(),
        quantity: balance.getQuantity(),
        blockedQuantity: balance.getBlockedQuantity(),
      }))
    };
  }
}
