import { OrderRepository } from "../../infra/repository/order-repository";
import { inject } from "../../infra/utils/registry";

export class ExecuteOrder {
  @inject("orderRepository")
  private readonly orderRepository!: OrderRepository;

  async execute(marketId: string): Promise<void> {
    while (true) {
      const highestBid = await this.orderRepository.getHighestBid(marketId);
      const lowestAsk = await this.orderRepository.getLowestAsk(marketId);

      if (!highestBid || !lowestAsk || highestBid.getPrice() < lowestAsk.getPrice()) break;

      const fillQuantity = Math.min(highestBid.getAvailableQuantity(), lowestAsk.getAvailableQuantity());
      const fillPrice = (highestBid.getTimestamp() > lowestAsk.getTimestamp()) ? lowestAsk.getPrice() : highestBid.getPrice();

      highestBid.fill(fillQuantity, fillPrice);
      lowestAsk.fill(fillQuantity, fillPrice);

      await this.orderRepository.update(highestBid);
      await this.orderRepository.update(lowestAsk);
    }
  }
}
