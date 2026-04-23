
import { AccountDAOInMemory } from "../src/account-DAO";

import { FundService } from "../src/fund-service";
import { FundDAOInMemory } from "../src/fund-DAO";
import { AccountService } from "../src/account-service";

let fundService: FundService;
let accountService: AccountService;

beforeEach(() => {
  const fundDAO = new FundDAOInMemory();
  const accountDAO = new AccountDAOInMemory();

  fundService = new FundService(fundDAO, accountDAO);
  accountService = new AccountService(accountDAO);
});

describe("Fund", () => {
  test("Deve criar um deposito", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await accountService.signup(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 1000
    }

    const depositOutput = await fundService.deposit(fundInput);
    const getFundOutput = await fundService.getFundById(depositOutput.fundId);

    expect(getFundOutput.accountId).toBe(fundInput.accountId);
    expect(getFundOutput.assetId).toBe(fundInput.assetId);
    expect(getFundOutput.quantity).toBe(fundInput.quantity);
  });

  test("Não deve criar um deposito com conta inexistente", async () => {
    const fundInput = {
      accountId: crypto.randomUUID(),
      assetId: "BTC",
      quantity: 1000
    }

    await expect(() => fundService.deposit(fundInput)).rejects.toThrow("Account not found");
  });

  test("Não deve criar um deposito com asset invalido", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await accountService.signup(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "ABC",
      quantity: 1000
    }
    await expect(() => fundService.deposit(fundInput)).rejects.toThrow("Invalid asset");
  });

  test("Não deve criar um deposito com quantidade invalida", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await accountService.signup(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 0
    }

    await expect(() => fundService.deposit(fundInput)).rejects.toThrow("Invalid quantity");
  });
});
