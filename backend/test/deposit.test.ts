import { AccountDAODatabase } from "../src/account-DAO";
import { Deposit } from "../src/deposit";
import { FundDAOInMemory } from "../src/fund-DAO";
import { SignUp } from "../src/signup";

let deposit: Deposit;
let signUp: SignUp;

beforeEach(() => {
  const fundDAO = new FundDAOInMemory();
  const accountDAO = new AccountDAODatabase();

  deposit = new Deposit(fundDAO, accountDAO);
  signUp = new SignUp(accountDAO);
});

describe("Deposit", () => {
  test("Deve criar um deposito", async () => {
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

    expect(depositOutput.accountId).toBe(fundInput.accountId);
    expect(depositOutput.assetId).toBe(fundInput.assetId);
    expect(depositOutput.quantity).toBe(fundInput.quantity);
  });

  test("Não deve criar um deposito com conta inexistente", async () => {
    const fundInput = {
      accountId: crypto.randomUUID(),
      assetId: "BTC",
      quantity: 1000
    }

    await expect(() => deposit.execute(fundInput)).rejects.toThrow("Account not found");
  });

  test("Não deve criar um deposito com asset invalido", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await signUp.execute(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "ABC",
      quantity: 1000
    }
    await expect(() => deposit.execute(fundInput)).rejects.toThrow("Invalid asset");
  });

  test("Não deve criar um deposito com quantidade invalida", async () => {
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
      quantity: 0
    }

    await expect(() => deposit.execute(fundInput)).rejects.toThrow("Invalid quantity");
  });
});
