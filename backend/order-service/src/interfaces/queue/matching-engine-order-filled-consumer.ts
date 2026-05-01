import { UpdateOrder } from "../../application/use-cases/update-order";
import { RabbitMQAdapter } from "../../infra/queue/rabbitmq-adapter";
import { inject } from "../../infra/utils/registry";

export class MatchingEngineOrderFilledConsumer {
  @inject("queue")
  private readonly queue!: RabbitMQAdapter;
  @inject("updateOrder")
  private readonly updateOrder!: UpdateOrder;

  constructor() {
    this.queue.consume("order.matching-engine.order-filled", this.handle.bind(this));
  }

  async handle(message: any) {
      const input = {
        orderId: message.orderId,
        accountId: message.accountId,
        marketId: message.marketId,
        side: message.side,
        quantity: message.quantity,
        price: message.price,
        fillQuantity: message.fillQuantity,
        fillPrice: message.fillPrice,
        status: message.status,
        timestamp: new Date(message.timestamp)
      };

      await this.updateOrder.execute(input);
  }
}
