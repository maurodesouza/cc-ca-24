import { inject } from "../../infra/utils/registry";
import { AccountRepository } from "../../infra/repository/account-repository";

type Output = {
  accountId: string;
  name: string;
  email: string;
  password: string;
  document: string;
}

export class GetAccount {
  @inject("accountRepository")
  private readonly accountRepository!: AccountRepository;


  async execute(accountId: string): Promise<Output> {
    const account = await this.accountRepository.getById(accountId);
    if (!account) throw new Error("Account not found");

    const output = {
      accountId: account.getAccountId(),
      name: account.getName(),
      email: account.getEmail(),
      password: account.getPassword(),
      document: account.getDocument(),
    }

    return output;
  }
}



