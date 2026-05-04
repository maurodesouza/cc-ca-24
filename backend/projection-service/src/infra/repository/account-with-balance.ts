import AccountWithBalance from "../models/account-with-balance";

export type BalanceDTO = {
  asset_id: number;
  quantity: string;
  blocked_quantity: string;
};

export type AccountWithBalanceDTO = {
  accountId: string;
  name: string;
  email: string;
  balance: BalanceDTO[];
};

export interface AccountWithBalanceRepository {
  save(account: AccountWithBalanceDTO): Promise<void>;
  update(account: AccountWithBalanceDTO): Promise<void>;
  getById(accountId: string): Promise<AccountWithBalanceDTO>;
}

export class AccountWithBalanceRepositoryMongo implements AccountWithBalanceRepository {
  async save(account: AccountWithBalanceDTO): Promise<void> {
    await AccountWithBalance.create(account);
  }

  async update(account: AccountWithBalanceDTO): Promise<void> {
    await AccountWithBalance.updateOne({ accountId: account.accountId }, account);
  }

  async getById(accountId: string): Promise<AccountWithBalanceDTO> {
    const account = await AccountWithBalance.findOne({ accountId });

    if (!account) {
      throw new Error('Account not found');
    }

    return {
      accountId: account.accountId,
      name: account.name,
      email: account.email,
      balance: account.balance,
    };
  }
}
