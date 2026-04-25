import { inject } from "../../infra/di/registry";
import { AccountRepository } from "../../infra/repository/account-repository";
import { WalletRepository } from "../../infra/repository/wallet-repository";

type Balance = {
  assetId: string;
  quantity: number;
}

type Output = {
  accountId: string;
  name: string;
  email: string;
  password: string;
  document: string;
  balances: Balance[];
}

export class GetAccount {
  @inject("accountRepository")
  private readonly accountRepository!: AccountRepository;
  @inject("walletRepository")
  private readonly walletRepository!: WalletRepository;

  async execute(accountId: string): Promise<Output> {
    const account = await this.accountRepository.getById(accountId);
    if (!account) throw new Error("Account not found");

    const wallet = await this.walletRepository.getByAccountId(account.getAccountId());

    const output = {
      accountId: account.getAccountId(),
      name: account.getName(),
      email: account.getEmail(),
      password: account.getPassword(),
      document: account.getDocument(),
      balances: wallet.balances.map((balance) => ({
        assetId: balance.getAssetId(),
        quantity: balance.getQuantity()
      })),
    }

    return output;
  }
}



