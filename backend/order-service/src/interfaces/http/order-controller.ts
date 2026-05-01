import { HTTPServer } from "../../application/http/http-server";
import { inject } from "../../infra/utils/registry";
import { PlaceOrder } from "../../application/use-cases/place-order";
import { GetOrder } from "../../application/use-cases/get-order";
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
  }
}
