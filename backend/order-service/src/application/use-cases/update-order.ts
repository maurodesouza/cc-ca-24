import { OrderRepository } from "../../infra/repository/order-repository";
import { inject } from "../../infra/di/registry";
import { Order } from "../../domain/order";

type Input = {
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

export class UpdateOrder {
  @inject("orderRepository")
  private readonly orderRepository!: OrderRepository;

  async execute(input: Input): Promise<void> {
    const order = new Order(
      input.orderId,
      input.accountId,
      input.marketId,
      input.side,
      input.quantity,
      input.price,
      input.fillQuantity,
      input.fillPrice,
      input.status,
      input.timestamp
    );

    await this.orderRepository.update(order);
  }
}
