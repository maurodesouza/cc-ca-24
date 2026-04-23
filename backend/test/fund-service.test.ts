
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

  test("Deve criar um saque", async () => {
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

  test("Não deve criar um saque com conta inexistente", async () => {
    const fundInput = {
      accountId: crypto.randomUUID(),
      assetId: "BTC",
      quantity: 1000
    }

    await expect(() => fundService.withdraw(fundInput)).rejects.toThrow("Account not found");
  });

  test("Não deve criar um saque com asset invalido", async () => {
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
    await expect(() => fundService.withdraw(fundInput)).rejects.toThrow("Invalid asset");
  });

  test("Não deve criar um saque com saldo insuficiente", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await accountService.signup(accountInput);

    const inputs = [
      {
        fundId: crypto.randomUUID(),
        accountId: accountOutput.accountId,
        assetId: "BTC",
        quantity: 200
      },
      {
        fundId: crypto.randomUUID(),
        accountId: accountOutput.accountId,
        assetId: "BTC",
        quantity: 300
      },
    ]

    await Promise.all(inputs.map(async (input) => {
      await fundService.deposit(input);
    }));

    const fundInput = {
      fundId: crypto.randomUUID(),
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 501
    }

    await expect(() => fundService.withdraw(fundInput)).rejects.toThrow("Insufficient balance");

  });
});
