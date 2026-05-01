import { Book } from "../../domain/book";
import { Order } from "../../domain/order";
import { inject } from "../../infra/utils/registry";
import { HTTPServer } from "../../application/http/http-server";

export class BookController {
  @inject("httpServer")
  private readonly httpServer!: HTTPServer;
  @inject("book")
  private readonly book!: Book;

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

  }
}
