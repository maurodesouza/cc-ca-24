import { inject } from "../di/registry";
import { Book } from "../../domain/book";
import { Order } from "../../domain/order";
import { HTTPServer } from "../../application/http/http-server";
import { OrderFilledEvent } from "../../domain/events/order-filled-event";
import { OrderGateway } from "../gateway/order-gateway";

export class BookController {
  @inject("httpServer")
  private readonly httpServer!: HTTPServer;
  @inject("book")
  private readonly book!: Book;
  @inject("orderGateway")
  private readonly orderGateway!: OrderGateway;

  constructor() {
    this.httpServer.route("post", "/markets/:marketId/orders", async (body: any, params: any) => {
      const order = new Order(
        body.orderId,
        body.accountId,
        body.marketId,
        body.side,
        body.quantity,
        body.price,
        body.fillQuantity,
        body.fillPrice,
        body.status,
        new Date(body.timestamp)
      );

      this.book.insert(order);
    });

    this.book.register(OrderFilledEvent, async (event: OrderFilledEvent) => {
      const order = event.getPayload()

      const input = {
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

      await this.orderGateway.update(input);
    });
  }
}
