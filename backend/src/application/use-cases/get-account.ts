import { AccountRepository } from "../../infra/repository/account-repository";

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
      accountId: account.getAccountId(),
      name: account.getName(),
      email: account.getEmail(),
      password: account.getPassword(),
      document: account.getDocument(),
      balances: account.balances.map((balance) => ({
        assetId: balance.getAssetId(),
        quantity: balance.getQuantity()
      })),
    }

    return output;
  }
}



