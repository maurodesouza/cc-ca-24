import { AccountRepository } from "./account-repository";

type Input = {
  accountId: string;
  assetId: string;
  quantity: number;
}
export class Withdraw {
  accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  async execute(input: Input): Promise<void> {
    const account = await this.accountRepository.getById(input.accountId);
    account.withdraw(input.assetId, input.quantity);
    await this.accountRepository.update(account);
  }
}
