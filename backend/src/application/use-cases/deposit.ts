import { WalletRepository } from "../../infra/repository/wallet-repository";
import { AccountRepository } from "../../infra/repository/account-repository";

type Input = {
  accountId: string;
  assetId: string;
  quantity: number;
}
export class Deposit {
  walletRepository: WalletRepository;
  accountRepository: AccountRepository;

  constructor(walletRepository: WalletRepository, accountRepository: AccountRepository) {
    this.walletRepository = walletRepository;
    this.accountRepository = accountRepository;
  }

  async execute(input: Input): Promise<void> {
    const account = await this.accountRepository.getById(input.accountId);
    if (!account) throw new Error("Account not found");

    const wallet = await this.walletRepository.getByAccountId(account.getAccountId());
    wallet.deposit(input.assetId, input.quantity);

    await this.walletRepository.update(wallet);
  }
}
