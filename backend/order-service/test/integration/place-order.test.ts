import { Deposit } from "../../src/application/use-cases/deposit";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { WalletRepositoryORM } from "../../src/infra/repository/wallet-repository";
import { AccountReferenceRepository } from "../../src/infra/repository/account-reference-repository";
import { GetOrder } from "../../src/application/use-cases/get-order";
import { OrderRepositoryORM } from "../../src/infra/repository/order-repository";
import { PlaceOrder } from "../../src/application/use-cases/place-order";
import { Registry } from "../../src/infra/utils/registry";
import { ORM } from "../../src/infra/orm/orm";
import { Queue } from "../../src/application/queue/queue";

let deposit: Deposit;
let queueMock: Partial<Queue>
let accountReferenceRepository: jest.Mocked<Pick<AccountReferenceRepository, 'exist'>>;
let getOrder: GetOrder;
let placeOrder: PlaceOrder;
let orderRepository: OrderRepositoryORM;
let walletRepository: WalletRepositoryORM;

let pgPromiseAdapter: PGPromiseAdapter;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();

  accountReferenceRepository = {
    exist: jest.fn() as jest.MockedFunction<(accountId: string) => Promise<boolean>>
  }

  queueMock = {
    publish: jest.fn().mockResolvedValue(undefined)
  }

  deposit = new Deposit();
  getOrder = new GetOrder();
  placeOrder = new PlaceOrder();
  orderRepository = new OrderRepositoryORM();
  walletRepository = new WalletRepositoryORM();

  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("walletRepository", walletRepository);
  Registry.getInstance().register("accountReferenceRepository", accountReferenceRepository);
  Registry.getInstance().register("queue", queueMock);
  Registry.getInstance().register("orderRepository", orderRepository);
  Registry.getInstance().register("deposit", deposit);
  Registry.getInstance().register("getOrder", getOrder);
  Registry.getInstance().register("placeOrder", placeOrder);
});

afterEach(async () => {
  await orderRepository.clear();
  await walletRepository.clear();
  await pgPromiseAdapter.close();
  Registry.getInstance().dependencies.clear();
});

describe("Place Order", () => {
  test("Deve criar uma order de compra em uma conta", async () => {
    accountReferenceRepository.exist.mockResolvedValue(true);

    const accountId = crypto.randomUUID();

    const fundInput = {
      accountId: accountId,
      assetId: "USD",
      quantity: 1000000
    }

    await deposit.execute(fundInput);

    const inputOrder = {
      accountId: accountId,
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

    expect(queueMock.publish).toHaveBeenCalledWith("order.events", expect.objectContaining({
      orderId: getOrderOutput.orderId,
      marketId: getOrderOutput.marketId,
      side: getOrderOutput.side,
      quantity: getOrderOutput.quantity,
      price: getOrderOutput.price,
    }), { routingKey: "order.placed" });
  });

  test("Não deve criar uma order de compra em uma conta que não existe", async () => {
    accountReferenceRepository.exist.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const accountId = crypto.randomUUID();

    const fundInput = {
      accountId: accountId,
      assetId: "USD",
      quantity: 1000000
    }

    await deposit.execute(fundInput)

    const inputOrder = {
      accountId: accountId,
      marketId: "BTC-USD",
      side: "buy",
      quantity: 1,
      price: 78000
    }

    await expect( async() => await placeOrder.execute(inputOrder)).rejects.toThrow("Account not found");
  });

  test("Não deve criar uma order de compra em uma conta se não tiver saldo", async () => {
    accountReferenceRepository.exist.mockResolvedValue(true);
    const accountId = crypto.randomUUID();

    const fundInput = {
      accountId: accountId,
      assetId: "USD",
      quantity: 10000
    }

    await deposit.execute(fundInput);

    const inputOrder = {
      accountId: accountId,
      marketId: "BTC-USD",
      side: "buy",
      quantity: 1,
      price: 78000
    }

    expect(() => placeOrder.execute(inputOrder)).rejects.toThrow("Insufficient funds")
  });

  test("Não deve criar mais de uma order de compra em uma conta se não tiver saldo", async () => {
    accountReferenceRepository.exist.mockResolvedValue(true);
    const accountId = crypto.randomUUID();

    const fundInput = {
      accountId: accountId,
      assetId: "USD",
      quantity: 5000
    }

    await deposit.execute(fundInput);

    const inputOrder = {
      accountId: accountId,
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
    accountReferenceRepository.exist.mockResolvedValue(true);
    const accountId = crypto.randomUUID();

    const BTCdeposit = {
      accountId: accountId,
      assetId: "BTC",
      quantity: 5
    };

    const USDdeposit = {
      accountId: accountId,
      assetId: "USD",
      quantity: 10000
    };

    await deposit.execute(BTCdeposit);
    await deposit.execute(USDdeposit);

    const sellOrder = {
      accountId: accountId,
      marketId: "BTC-USD",
      side: "sell",
      quantity: 1,
      price: 5000
    };

    const buyOrder = {
      accountId: accountId,
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
});
