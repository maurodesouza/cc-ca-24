import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { Registry } from "../../src/infra/di/registry";
import { ORM } from "../../src/infra/orm/orm";
import { Order } from "../../src/domain/order";
import { OrderModel } from "../../src/infra/orm/models/order-model";
import { OrderRepositoryORM } from "../../src/infra/repository/order-repository";

let connection: PGPromiseAdapter;
let orderRepository: OrderRepositoryORM
let orm: ORM

beforeEach(() => {
  connection = new PGPromiseAdapter();
  orderRepository = new OrderRepositoryORM();
  orm = new ORM();

  Registry.getInstance().register("databaseConnection", connection);
  Registry.getInstance().register("orm", orm);
  Registry.getInstance().register("orderRepository", orderRepository);
});

afterEach(async () => {
  await orderRepository.clear();
  await connection.close();
  Registry.getInstance().dependencies.clear();
})

const accountId = crypto.randomUUID()

describe("ORM", () => {
  test("Deve testar o ORM", async () => {
    const order = Order.create(accountId, "BTC-USD", "buy", 1, 60000);
    const orderModel = OrderModel.fromEntity(order);

    await orm.save(orderModel)
    const persistedOrderModel = await orm.findOne(OrderModel, { where: { order_id: order.getOrderId() } })

    const persistedOrder = persistedOrderModel?.toEntity()

    expect(persistedOrder).toBeDefined()
    expect(persistedOrder?.getOrderId()).toBe(order.getOrderId())
    expect(persistedOrder?.getAccountId()).toBe(order.getAccountId())
    expect(persistedOrder?.getMarketId()).toBe(order.getMarketId())
    expect(persistedOrder?.getSide()).toBe(order.getSide())
    expect(persistedOrder?.getQuantity()).toBe(order.getQuantity())
    expect(persistedOrder?.getPrice()).toBe(order.getPrice())
  })

  test("Deve testar o order repository", async () => {
    const order = Order.create(accountId, "BTC-USD", "buy", 1, 60000);

    await orderRepository.save(order)
    const persistedOrder = await orderRepository.getById(order.getOrderId())

    expect(persistedOrder.getOrderId()).toBe(order.getOrderId())
    expect(persistedOrder.getAccountId()).toBe(order.getAccountId())
    expect(persistedOrder.getMarketId()).toBe(order.getMarketId())
    expect(persistedOrder.getSide()).toBe(order.getSide())
    expect(persistedOrder.getQuantity()).toBe(order.getQuantity())
    expect(persistedOrder.getPrice()).toBe(order.getPrice())
  })
})
