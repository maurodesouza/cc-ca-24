import axios from "axios";
import { FundDAODatabase } from "../src/fund-DAO";

axios.defaults.validateStatus = () => true;

test("Deve persistir um fundo no banco de dados", async () => {
  const input = {
    fundId: crypto.randomUUID(),
    accountId: crypto.randomUUID(),
    assetId: "BTC",
    quantity: 1000
  }

  const fundDAO = new FundDAODatabase();

  await fundDAO.save(input);
  const getFundOutput = await fundDAO.getById(input.fundId);

  expect(getFundOutput.fund_id).toBe(input.fundId);
  expect(getFundOutput.asset_id).toBe(input.assetId);
  expect(getFundOutput.quantity).toBe(input.quantity);
  expect(getFundOutput.account_id).toBe(input.accountId);
});

test("Deve retornar o balanço de uma conta", async () => {
  const accountId = crypto.randomUUID();

  const input = [
    {
      fundId: crypto.randomUUID(),
      accountId: accountId,
      assetId: "BTC",
      quantity: 1000
    },
    {
      fundId: crypto.randomUUID(),
      accountId: accountId,
      assetId: "BTC",
      quantity: 500
    },
    {
      fundId: crypto.randomUUID(),
      accountId: accountId,
      assetId: "BTC",
      quantity: -1200
    }
  ]
  const fundDAO = new FundDAODatabase();

  await fundDAO.save(input[0]);
  await fundDAO.save(input[1]);
  await fundDAO.save(input[2]);

  const getFundOutput = await fundDAO.getBalance(accountId, "BTC");

  expect(getFundOutput).toBe(300);
});

