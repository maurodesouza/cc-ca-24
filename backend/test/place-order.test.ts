import { SignUp } from "../src/application/use-cases/signup";
import { Deposit } from "../src/application/use-cases/deposit";
import { GetAccount } from "../src/application/use-cases/get-account";
import { PGPromiseAdapter } from "../src/infra/database/pg-promise-adapter";
import { AccountRepositoryDatabase } from "../src/infra/repository/account-repository";
import { WalletRepositoryDatabase } from "../src/infra/repository/wallet-repository";
import { GetOrder } from "../src/application/use-cases/get-order";
import { OrderRepositoryDatabase } from "../src/infra/repository/order-repository";
import { PlaceOrder } from "../src/application/use-cases/place-order";
import { Registry } from "../src/infra/di/registry";

let deposit: Deposit;
let signUp: SignUp;
let getAccount: GetAccount;
let getOrder: GetOrder;
let placeOrder: PlaceOrder;
let orderRepository: OrderRepositoryDatabase;

let pgPromiseAdapter: PGPromiseAdapter;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();
  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("accountRepository", new AccountRepositoryDatabase());
  Registry.getInstance().register("walletRepository", new WalletRepositoryDatabase());
  Registry.getInstance().register("orderRepository", new OrderRepositoryDatabase());
  Registry.getInstance().register("deposit", new Deposit());
  Registry.getInstance().register("signUp", new SignUp());
  Registry.getInstance().register("getAccount", new GetAccount());
  Registry.getInstance().register("getOrder", new GetOrder());
  Registry.getInstance().register("placeOrder", new PlaceOrder());

  deposit = new Deposit();
  signUp = new SignUp();
  getAccount = new GetAccount();
  getOrder = new GetOrder();
  placeOrder = new PlaceOrder();
  orderRepository = new OrderRepositoryDatabase();
});

afterEach(async () => {
  await orderRepository.clear();
  Registry.getInstance().dependencies.clear();
  await pgPromiseAdapter.close();
});

const accountInput = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

describe("Place Order", () => {
  test("Deve criar uma order de compra em uma conta", async () => {
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

  test("Não deve criar mais de uma order de compra em uma conta se não tiver saldo", async () => {
    const accountOutput = await signUp.execute(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "USD",
      quantity: 5000
    }

    await deposit.execute(fundInput);

    const inputOrder = {
      accountId: accountOutput.accountId,
      marketId: "BTC-USD",
      side: "buy",
      quantity: 1,
      price: 5000
    }

    const outputPlaceOrder = await placeOrder.execute(inputOrder)
    expect(outputPlaceOrder.orderId).toBeDefined()

    expect(() => placeOrder.execute(inputOrder)).rejects.toThrow("Insufficient funds")
  });

  test("Deve criar uma ordem de compra e uma ordem de venda em uma conta", async () => {
    const outputSignup = await signUp.execute(accountInput);

    const BTCdeposit = {
      accountId: outputSignup.accountId,
      assetId: "BTC",
      quantity: 5
    };

    const USDdeposit = {
      accountId: outputSignup.accountId,
      assetId: "USD",
      quantity: 10000
    };

    await deposit.execute(BTCdeposit);
    await deposit.execute(USDdeposit);

    const sellOrder = {
      accountId: outputSignup.accountId,
      marketId: "BTC-USD",
      side: "sell",
      quantity: 1,
      price: 5000
    };

    const buyOrder = {
      accountId: outputSignup.accountId,
      marketId: "BTC-USD",
      side: "buy",
      quantity: 1,
      price: 1000
    };

    const outputPlaceOrder1 = await placeOrder.execute(sellOrder);
    const outputPlaceOrder2 = await placeOrder.execute(buyOrder);

    const order1 = await getOrder.execute(outputPlaceOrder1.orderId);
    const order2 = await getOrder.execute(outputPlaceOrder2.orderId);

    expect(order1.status).toBe("open");
    expect(order2.status).toBe("open");
  });

  test("Deve preencher parcialmente uma ordem de compra e uma ordem de venda", async () => {

    const outputSignup = await signUp.execute(accountInput);

    const BTCdeposit = {
      accountId: outputSignup.accountId,
      assetId: "BTC",
      quantity: 5
    };

    const USDdeposit = {
      accountId: outputSignup.accountId,
      assetId: "USD",
      quantity: 200000
    };

    await deposit.execute(BTCdeposit);
    await deposit.execute(USDdeposit);

    const sellOrder = {
      accountId: outputSignup.accountId,
      marketId: "BTC-USD",
      side: "sell",
      quantity: 4,
      price: 5000
    };

    const buyOrder = {
      accountId: outputSignup.accountId,
      marketId: "BTC-USD",
      side: "buy",
      quantity: 3,
      price: 6000
    };

    const outputPlaceOrder1 = await placeOrder.execute(sellOrder);
    const outputPlaceOrder2 = await placeOrder.execute(buyOrder);

    const order1 = await getOrder.execute(outputPlaceOrder1.orderId);
    const order2 = await getOrder.execute(outputPlaceOrder2.orderId);

    expect(order1.status).toBe("open");
    expect(order1.fillQuantity).toBe(3);

    expect(order2.fillQuantity).toBe(3);
    expect(order2.status).toBe("closed");
  });

  test("Deve fechar todas as ordens", async () => {
    const outputSignup = await signUp.execute(accountInput);

    const BTCdeposit = {
      accountId: outputSignup.accountId,
      assetId: "BTC",
      quantity: 5
    };

    const USDdeposit = {
      accountId: outputSignup.accountId,
      assetId: "USD",
      quantity: 200000
    };

    await deposit.execute(BTCdeposit);
    await deposit.execute(USDdeposit);

    const sellOrder = {
      accountId: outputSignup.accountId,
      marketId: "BTC-USD",
      side: "sell",
      quantity: 1,
      price: 5000
    };

    const buyOrder = {
      accountId: outputSignup.accountId,
      marketId: "BTC-USD",
      side: "buy",
      quantity: 2,
      price: 5000
    };

    const outputPlaceOrder1 = await placeOrder.execute(sellOrder);
    const outputPlaceOrder2 = await placeOrder.execute(sellOrder);
    const outputPlaceOrder3 = await placeOrder.execute(buyOrder);

    const order1 = await getOrder.execute(outputPlaceOrder1.orderId);
    const order2 = await getOrder.execute(outputPlaceOrder2.orderId);
    const order3 = await getOrder.execute(outputPlaceOrder3.orderId);

    expect(order1.status).toBe("closed");
    expect(order2.status).toBe("closed");
    expect(order3.status).toBe("closed");
  });
});
