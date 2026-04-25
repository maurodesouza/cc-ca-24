import { SignUp } from "../src/application/use-cases/signup";
import { Deposit } from "../src/application/use-cases/deposit";
import { GetAccount } from "../src/application/use-cases/get-account";
import { PGPromiseAdapter } from "../src/infra/database/pg-promise-adapter";
import { AccountRepositoryDatabase } from "../src/infra/repository/account-repository";
import { WalletRepositoryDatabase } from "../src/infra/repository/wallet-repository";
import { GetOrder } from "../src/application/use-cases/get-order";
import { OrderRepositoryDatabase } from "../src/infra/repository/order-repository";
import { PlaceOrder } from "../src/application/use-cases/place-order";

let deposit: Deposit;
let signUp: SignUp;
let getAccount: GetAccount;
let getOrder: GetOrder;
let placeOrder: PlaceOrder;

let pgPromiseAdapter: PGPromiseAdapter;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();
  const accountRepository = new AccountRepositoryDatabase(pgPromiseAdapter);
  const walletRepository = new WalletRepositoryDatabase(pgPromiseAdapter);
  const orderRepository = new OrderRepositoryDatabase(pgPromiseAdapter);

  deposit = new Deposit(walletRepository, accountRepository);
  signUp = new SignUp(accountRepository);
  getAccount = new GetAccount(accountRepository, walletRepository);
  getOrder = new GetOrder(orderRepository);
  placeOrder = new PlaceOrder(walletRepository, accountRepository, orderRepository);
});

afterEach(async () => {
  await pgPromiseAdapter.close();
});

describe("Place Order", () => {
  test("Deve criar uma order de compra em uma conta", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await signUp.execute(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "USD",
      quantity: 1000000
    }

    await deposit.execute(fundInput);

    const inputOrder = {
      accountId: accountOutput.accountId,
      marketId: "BTC-USD",
      side: "buy",
      quantity: 1,
      price: 78000
    }

    const outputPlaceOrder = await placeOrder.execute(inputOrder)
    expect(outputPlaceOrder.orderId).toBeDefined()

    const getOrderOutput = await getOrder.execute(outputPlaceOrder.orderId)

    expect(getOrderOutput.quantity).toBe(inputOrder.quantity)
    expect(getOrderOutput.price).toBe(inputOrder.price)
  });

    test("Não deve criar uma order de compra em uma conta se não tiver saldo", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await signUp.execute(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "USD",
      quantity: 10000
    }

    await deposit.execute(fundInput);

    const inputOrder = {
      accountId: accountOutput.accountId,
      marketId: "BTC-USD",
      side: "buy",
      quantity: 1,
      price: 78000
    }

    expect(() => placeOrder.execute(inputOrder)).rejects.toThrow("Insufficient funds")
  });
});
