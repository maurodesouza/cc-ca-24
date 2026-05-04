import { Order } from "../../domain/order";

export class OrderEventMapper {
  static toPayload(order: Order) {
    return {
      orderId: order.getOrderId(),
      accountId: order.getAccountId(),
      marketId: order.getMarketId(),
      side: order.getSide(),
      quantity: order.getQuantity(),
      price: order.getPrice(),
      fillQuantity: order.getFillQuantity(),
      fillPrice: order.getFillPrice(),
      status: order.getStatus(),
      timestamp: order.getTimestamp(),
    };
  }
}
