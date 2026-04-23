import { AccountRepository } from "./account-repository";

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
  accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  async execute(accountId: string): Promise<Output> {
    const account = await this.accountRepository.getById(accountId);

    if (!account) {
      throw new Error("Account not found");
    }

    const output = {
      accountId: account.accountId,
      name: account.name,
      email: account.email,
      password: account.password,
      document: account.document,
      balances: account.balances.map(balance => ({
        assetId: balance.assetId,
        quantity: balance.quantity
      })),
    }

    return output;
  }
}



