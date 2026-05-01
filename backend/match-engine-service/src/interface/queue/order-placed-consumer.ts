import { Book } from "../../domain/book";
import { Order } from "../../domain/order";
import { inject } from "../../infra/di/registry";
import { RabbitMQAdapter } from "../../infra/queue/rabbitmq-adapter";

export class OrderPlacedConsumer {
  @inject("book")
  private readonly book!: Book;

  @inject("queue")
  private readonly queue!: RabbitMQAdapter;

  constructor() {
    this.queue.consume("matching-engine.order.placed", this.handle.bind(this));
  }

  async handle(message: any) {
    const order = new Order(
      message.orderId,
      message.accountId,
      message.marketId,
      message.side,
      message.quantity,
      message.price,
      message.fillQuantity,
      message.fillPrice,
      message.status,
      new Date(message.timestamp)
    );

    this.book.insert(order);
  }
}
