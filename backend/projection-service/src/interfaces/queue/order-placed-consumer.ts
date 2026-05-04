import { Queue } from "../../application/queue/queue";
import { DepthRepository } from "../../infra/repository/depth-repository";
import { inject } from "../../infra/utils/registry";

export class OrderPlacedConsumer {
  @inject("queue")
  private readonly queue!: Queue;
  @inject("depth-repository")
  private readonly depthRepository!: DepthRepository;

  constructor() {
    this.queue.consume("projection.order.placed", this.handle.bind(this));
  }

  async handle(message: any) {
    const input = {
      side: message.side,
      price: message.price,
      quantity: message.quantity,
      marketId: message.marketId,
    }

    await this.depthRepository.increment(input);
  }
}
