import axios from "axios";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { WalletRepositoryORM } from "../../src/infra/repository/wallet-repository";
import { OrderRepositoryORM } from "../../src/infra/repository/order-repository";
import { Registry } from "../../src/infra/utils/registry";
import { ORM } from "../../src/infra/orm/orm";
import { sleep } from "../../src/utils/sleep";

axios.defaults.validateStatus = () => true;

let pgPromiseAdapter: PGPromiseAdapter;
let walletRepository: WalletRepositoryORM;
let orderRepository: OrderRepositoryORM;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();
  walletRepository = new WalletRepositoryORM();
  orderRepository = new OrderRepositoryORM();

  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("walletRepository", walletRepository);
  Registry.getInstance().register("orderRepository", orderRepository);
});

afterEach(async () => {
  await walletRepository.clear();
  await orderRepository.clear();
  await pgPromiseAdapter.close();
  Registry.getInstance().dependencies.clear();
});

const validInput = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

describe("Account", () => {
  test("Deve criar uma ordem de compra e uma ordem de venda em uma conta", async () => {
    const marketId = "BTC-USD";
    const input = { ...validInput }

    const responseSignup = await axios.post("http://localhost:4156/signup", input);
    const outputSignup = responseSignup.data;

    const BTCdeposit = {
        accountId: outputSignup.accountId,
        assetId: "BTC",
        quantity: 2
    }

    const USDdeposit = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 200000
    }

    await axios.post("http://localhost:4157/deposit", BTCdeposit);
    await axios.post("http://localhost:4157/deposit", USDdeposit);

    const order1 = {
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 78000
    }

    const order2 = {
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 79000
    }

    const order3 = {
        accountId: outputSignup.accountId,
        marketId,
        side: "buy",
        quantity: 2,
        price: 80000
    }

    const outputPlaceOrder1 = (await axios.post("http://localhost:4157/place-order", order1)).data;
    const outputPlaceOrder2 = (await axios.post("http://localhost:4157/place-order", order2)).data;
    const outputPlaceOrder3 = (await axios.post("http://localhost:4157/place-order", order3)).data;

    await sleep(500);

    const outputGetOrder1 = (await axios.get(`http://localhost:4157/orders/${outputPlaceOrder1.orderId}`)).data;
    const outputGetOrder2 = (await axios.get(`http://localhost:4157/orders/${outputPlaceOrder2.orderId}`)).data;
    const outputGetOrder3 = (await axios.get(`http://localhost:4157/orders/${outputPlaceOrder3.orderId}`)).data;

    expect(outputGetOrder1.fillQuantity).toBe(1);
    expect(outputGetOrder1.fillPrice).toBe(78000);
    expect(outputGetOrder1.status).toBe("closed");

    expect(outputGetOrder2.fillQuantity).toBe(1);
    expect(outputGetOrder2.fillPrice).toBe(79000);
    expect(outputGetOrder2.status).toBe("closed");

    expect(outputGetOrder3.fillQuantity).toBe(2);
    expect(outputGetOrder3.fillPrice).toBe(78500);
    expect(outputGetOrder3.status).toBe("closed");
});
});
