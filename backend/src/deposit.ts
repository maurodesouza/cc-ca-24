import crypto from "crypto";

import { FundDAO } from "./fund-DAO";
import { AccountDAO } from "./account-DAO";

const VALID_ASSETS = ["BTC", "USD"];

type Input = {
  accountId: string;
  assetId: string;
  quantity: number;
}

type Output = {
  fundId: string;
  accountId: string;
  assetId: string;
  quantity: number;
}

export class Deposit {
  fundDAO: FundDAO;
  accountDAO: AccountDAO;

  constructor(fundDAO: FundDAO, accountDAO: AccountDAO) {
    this.fundDAO = fundDAO;
    this.accountDAO = accountDAO;
  }

  async execute(input: Input): Promise<Output> {
    const fund = {
      fundId: crypto.randomUUID(),
      accountId: input.accountId,
      assetId: input.assetId,
      quantity: input.quantity,
    }

    const account = await this.accountDAO.getById(fund.accountId);

    if (!account) throw new Error("Account not found");
    if (!VALID_ASSETS.includes(fund.assetId)) throw new Error("Invalid asset");
    if (fund.quantity <= 0) throw new Error("Invalid quantity");

    await this.fundDAO.save(fund);

    const output = {
      fundId: fund.fundId,
      accountId: fund.accountId,
      assetId: fund.assetId,
      quantity: fund.quantity,
    }

    return output;
  }
}
