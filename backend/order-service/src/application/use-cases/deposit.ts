import { inject } from "../../infra/utils/registry";
import { WalletRepository } from "../../infra/repository/wallet-repository";
import { AccountGateway } from "../../infra/gateway/account-gateway";

type Input = {
  accountId: string;
  assetId: string;
  quantity: number;
}
export class Deposit {
  @inject("walletRepository")
  private readonly walletRepository!: WalletRepository;
  @inject("accountGateway")
  private readonly accountGateway!: AccountGateway;

  async execute(input: Input): Promise<void> {
    const account = await this.accountGateway.getById(input.accountId);
    if (!account) throw new Error("Account not found");

    const wallet = await this.walletRepository.getByAccountId(input.accountId);
    wallet.deposit(input.assetId, input.quantity);

    await this.walletRepository.update(wallet);
  }
}
