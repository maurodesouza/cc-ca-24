import { inject } from "../../infra/di/registry";
import { WalletRepository } from "../../infra/repository/wallet-repository";

type Balance = {
  assetId: string;
  quantity: number;
}

type Output = {
  accountId: string;
  balances: Balance[];
}

export class GetWallet {
  @inject("walletRepository")
  private readonly walletRepository!: WalletRepository;

  async execute(accountId: string): Promise<Output> {
    const wallet = await this.walletRepository.getByAccountId(accountId);

    const output = {
      accountId: wallet.getAccountId(),
      balances: wallet.balances.map((balance) => ({
        assetId: balance.getAssetId(),
        quantity: balance.getQuantity()
      })),
    }

    return output;
  }
}



