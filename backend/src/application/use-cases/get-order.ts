import { OrderRepository } from "../../infra/repository/order-repository";

type Output = {
  orderId: string;
  accountId: string;
  marketId: string;
  side: string;
  quantity: number;
  price: number;
  fillQuantity: number;
  fillPrice: number;
  status: string;
  timestamp: Date;
}

export class GetOrder {
  orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId: string): Promise<Output> {
    const order = await this.orderRepository.getById(orderId);
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
