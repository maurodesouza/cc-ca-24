import { AccountDAODatabase } from "../src/account-DAO";
import { GetFund } from "../src/get-fund";
import { FundDAOInMemory } from "../src/fund-DAO";
import { SignUp } from "../src/signup";
import { Deposit } from "../src/deposit";

let getFund: GetFund;
let deposit: Deposit;
let signUp: SignUp;

beforeEach(() => {
  const fundDAO = new FundDAOInMemory();
  const accountDAO = new AccountDAODatabase();

  getFund = new GetFund(fundDAO);
  deposit = new Deposit(fundDAO, accountDAO);
  signUp = new SignUp(accountDAO);
});

describe("GetFund", () => {
  test("Deve obter um fundo pelo ID", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await signUp.execute(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 1000
    }

    const depositOutput = await deposit.execute(fundInput);
    const getFundOutput = await getFund.execute(depositOutput.fundId);

    expect(getFundOutput.accountId).toBe(fundInput.accountId);
    expect(getFundOutput.assetId).toBe(fundInput.assetId);
    expect(getFundOutput.quantity).toBe(fundInput.quantity);
  });

  test("Não deve obter um fundo com ID inexistente", async () => {
    await expect(() => getFund.execute(crypto.randomUUID())).rejects.toThrow("Fund not found");
  });
});
