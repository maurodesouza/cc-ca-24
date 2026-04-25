import { Order } from "../../domain/order";
import { DatabaseConnection } from "../../application/database/database-connection";

export interface OrderRepository {
  save(order: Order): Promise<void>;
  getById(orderId: string): Promise<Order>;
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
}
