import { FundDAO } from "./fund-DAO";

type Output = {
  fundId: string;
  accountId: string;
  assetId: string;
  quantity: number;
}

export class GetFund {
  fundDAO: FundDAO;

  constructor(fundDAO: FundDAO) {
    this.fundDAO = fundDAO;
  }

  async execute(fundId: string): Promise<Output> {
    const fund = await this.fundDAO.getById(fundId);

    if (!fund) throw new Error("Fund not found");

    const output = {
      fundId: fund.fundId,
      accountId: fund.accountId,
      assetId: fund.assetId,
      quantity: fund.quantity,
    }

    return output;
  }
}
