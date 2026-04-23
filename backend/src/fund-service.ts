import { FundDAO } from "./fund-DAO";

const VALID_ASSETS = ["BTC", "USD"];

export class FundService {
  fundDAO: FundDAO;
  accountDAO: any;

  constructor(fundDAO: FundDAO, accountDAO: any) {
    this.fundDAO = fundDAO;
    this.accountDAO = accountDAO;
  }

  async deposit(input: any) {
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

    return fund;
  }

  async withdraw(fundId: string) {

  }

  getFundById(fundId: string) {
    const fund = this.fundDAO.getById(fundId);

    if (!fund) throw new Error("Fund not found");

    return fund;
  }
}



