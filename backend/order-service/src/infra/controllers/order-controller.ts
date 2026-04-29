import { HTTPServer } from "../../application/http/http-server";
import { inject } from "../di/registry";
import { PlaceOrder } from "../../application/use-cases/place-order";
import { GetOrder } from "../../application/use-cases/get-order";
import { Mediator } from "../mediator/mediator";
import { OrderPlacedEvent } from "../../domain/events/order-placed-event";
import { Book } from "../../domain/book";
import { OrderFilledEvent } from "../../domain/events/order-filled-event";
import { UpdateOrder } from "../../application/use-cases/update-order";

export class OrderController {
  @inject("httpServer")
  private readonly httpServer!: HTTPServer;
  @inject("placeOrder")
  private readonly placeOrder!: PlaceOrder;
  @inject("getOrder")
  private readonly getOrder!: GetOrder;
  @inject("updateOrder")
  private readonly updateOrder!: UpdateOrder;
  @inject("mediator")
  private readonly mediator!: Mediator;
  @inject("book")
  private readonly book!: Book;

  constructor() {
    this.httpServer.route("post", "/place-order", async (body: any) => {
      const output = await this.placeOrder.execute(body);
      return output;
    });

    this.httpServer.route("get", "/orders/:id", async (_: any, params: any) => {
      const output = await this.getOrder.execute(params.id);
      return output;
    });

    this.httpServer.route("put", "/orders/:id", async (body: any, params: any) => {
      const output = await this.updateOrder.execute({ ...body, id: params.id });
      return output;
    });

    this.mediator.register(OrderPlacedEvent, async (event: OrderPlacedEvent) => {
      this.book.insert(event.getPayload());
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

      await this.updateOrder.execute(input);
    });
  }
}
