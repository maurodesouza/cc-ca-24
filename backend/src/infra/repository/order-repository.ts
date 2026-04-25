import { Order } from "../../domain/order";
import { DatabaseConnection } from "../../application/database/database-connection";

export interface OrderRepository {
  save(order: Order): Promise<void>;
  getById(orderId: string): Promise<Order>;
  update(order: Order): Promise<void>;
  getHighestBid(marketId: string): Promise<Order | null>;
  getLowestAsk(marketId: string): Promise<Order | null>;
  clear(): Promise<void>;
}

export class OrderRepositoryDatabase implements OrderRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(order: Order): Promise<void> {
    await this.connection.query(
      "insert into ccca.order (order_id, market_id, account_id, side, quantity, price, fill_quantity, fill_price, status, timestamp) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [
        order.getOrderId(),
        order.getMarketId(),
        order.getAccountId(),
        order.getSide(),
        order.getQuantity(),
        order.getPrice(),
        order.getFillQuantity(),
        order.getFillPrice(),
        order.getStatus(),
        order.getTimestamp(),
      ],
    );
  }

  async getById(orderId: string): Promise<Order> {
    const [orderRaw] = await this.connection.query("select * from ccca.order where order_id = $1", [orderId]);
    if (!orderRaw) throw new Error("Order not found");
    return new Order(
      orderRaw.order_id,
      orderRaw.account_id,
      orderRaw.market_id,
      orderRaw.side,
      parseFloat(orderRaw.quantity),
      parseFloat(orderRaw.price),
      parseFloat(orderRaw.fill_quantity),
      parseFloat(orderRaw.fill_price),
      orderRaw.status,
      orderRaw.timestamp,
    );
  }

  async update(order: Order): Promise<void> {
    await this.connection.query(
      "update ccca.order set account_id = $1, market_id = $2, side = $3, quantity = $4, price = $5, fill_quantity = $6, fill_price = $7, status = $8, timestamp = $9 where order_id = $10",
      [
        order.getAccountId(),
        order.getMarketId(),
        order.getSide(),
        order.getQuantity(),
        order.getPrice(),
        order.getFillQuantity(),
        order.getFillPrice(),
        order.getStatus(),
        order.getTimestamp(),
        order.getOrderId(),
      ],
    );
  }

  async getHighestBid(marketId: string): Promise<Order | null> {
    const [orderRaw] = await this.connection.query("select * from ccca.order where market_id = $1 and side = $2 and status = $3 order by price desc, timestamp asc limit 1", [marketId, "buy", "open"]);
    if (!orderRaw) return null;
    return new Order(
      orderRaw.order_id,
      orderRaw.account_id,
      orderRaw.market_id,
      orderRaw.side,
      parseFloat(orderRaw.quantity),
      parseFloat(orderRaw.price),
      parseFloat(orderRaw.fill_quantity),
      parseFloat(orderRaw.fill_price),
      orderRaw.status,
      orderRaw.timestamp,
    );
  }

  async getLowestAsk(marketId: string): Promise<Order | null> {
    const [orderRaw] = await this.connection.query("select * from ccca.order where market_id = $1 and side = $2 and status = $3 order by price asc, timestamp asc limit 1", [marketId, "sell", "open"]);
    if (!orderRaw) return null;
    return new Order(
      orderRaw.order_id,
      orderRaw.account_id,
      orderRaw.market_id,
      orderRaw.side,
      parseFloat(orderRaw.quantity),
      parseFloat(orderRaw.price),
      parseFloat(orderRaw.fill_quantity),
      parseFloat(orderRaw.fill_price),
      orderRaw.status,
      orderRaw.timestamp,
    );
  }

  async clear(): Promise<void> {
    await this.connection.query("delete from ccca.order", []);
  }
}
