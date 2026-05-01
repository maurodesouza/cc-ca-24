import { inject } from "../../infra/utils/registry";
import { WalletRepository } from "../../infra/repository/wallet-repository";
import { AccountReferenceRepository } from "../../infra/repository/account-reference-repository";

type Input = {
  accountId: string;
  assetId: string;
  quantity: number;
}
export class Deposit {
  @inject("walletRepository")
  private readonly walletRepository!: WalletRepository;
  @inject("accountReferenceRepository")
  private readonly accountReferenceRepository!: AccountReferenceRepository;

  async execute(input: Input): Promise<void> {
    const accountExists = await this.accountReferenceRepository.exist(input.accountId);
    if (!accountExists) throw new Error("Account not found");

    const wallet = await this.walletRepository.getByAccountId(input.accountId);
    wallet.deposit(input.assetId, input.quantity);

    await this.walletRepository.update(wallet);
  }
}
