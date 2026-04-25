import { WalletRepository } from "../../infra/repository/wallet-repository";
import { AccountRepository } from "../../infra/repository/account-repository";
import { inject } from "../../infra/di/registry";

type Input = {
  accountId: string;
  assetId: string;
  quantity: number;
}
export class Deposit {
  @inject("walletRepository")
  private readonly walletRepository!: WalletRepository;
  @inject("accountRepository")
  private readonly accountRepository!: AccountRepository;

  async execute(input: Input): Promise<void> {
    const account = await this.accountRepository.getById(input.accountId);
    if (!account) throw new Error("Account not found");

    const wallet = await this.walletRepository.getByAccountId(account.getAccountId());
    wallet.deposit(input.assetId, input.quantity);

    await this.walletRepository.update(wallet);
  }
}
