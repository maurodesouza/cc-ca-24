import express from "express";
import cors from "cors";

import { ExpressAdapter } from "./infra/http/express-adapter";

import { Registry } from "./infra/di/registry";
import { Mediator } from "./infra/mediator/mediator";
import { BookController } from "./infra/controllers/book-controller";
import { OrderGatewayHTTP } from "./infra/gateway/order-gateway";
import { Book } from "./domain/book";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";


const PORT = 4158;

async function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const httpServer = new ExpressAdapter();
  const queue = new RabbitMQAdapter();

  await queue.connect();
  await queue.setup("order-placed", "order-placed.insert-order-to-book");
  await queue.setup("order-filled", "order-filled.update-order");

  Registry.getInstance().register("httpServer", httpServer);
  Registry.getInstance().register("mediator", new Mediator());
  Registry.getInstance().register("orderGateway", new OrderGatewayHTTP());
  Registry.getInstance().register("queue", queue);

  Registry.getInstance().register("book", new Book("BTC-USD"));

  new BookController();

  httpServer.listen(PORT);
}

main();
