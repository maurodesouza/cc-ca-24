import { HTTPServer } from "../../application/http/http-server";
import { inject } from "../di/registry";
import { PlaceOrder } from "../../application/use-cases/place-order";
import { GetOrder } from "../../application/use-cases/get-order";
import { Mediator } from "../mediator/mediator";
import { OrderPlacedEvent } from "../../domain/events/order-placed-event";
import { ExecuteOrder } from "../../application/use-cases/execute-order";

export class OrderController {
  @inject("httpServer")
  private readonly httpServer!: HTTPServer;
  @inject("placeOrder")
  private readonly placeOrder!: PlaceOrder;
  @inject("getOrder")
  private readonly getOrder!: GetOrder;
  @inject("executeOrder")
  private readonly executeOrder!: ExecuteOrder;
  @inject("mediator")
  private readonly mediator!: Mediator;

  constructor() {
    this.httpServer.route("post", "/place-order", async (body: any) => {
      const output = await this.placeOrder.execute(body);
      return output;
    });

    this.httpServer.route("get", "/orders/:id", async (_: any, params: any) => {
      const output = await this.getOrder.execute(params.id);
      return output;
    });

    this.mediator.register(OrderPlacedEvent, async (event: OrderPlacedEvent) => {
      await this.executeOrder.execute(event.getPayload());
    });
  }
}
