import { AccountDAO } from "./account-DAO";

type Output = {
  accountId: string;
  name: string;
  email: string;
  password: string;
  document: string;
}

export class GetAccount {
  accountDAO: AccountDAO;

  constructor(accountDAO: AccountDAO) {
    this.accountDAO = accountDAO;
  }

  async execute(accountId: string): Promise<Output> {
    const account = await this.accountDAO.getById(accountId);

    if (!account) {
      throw new Error("Account not found");
    }

    const output = {
      accountId: account.account_id,
      name: account.name,
      email: account.email,
      password: account.password,
      document: account.document,
    }

    return output;
  }
}



