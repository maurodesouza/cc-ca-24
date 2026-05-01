import express from "express";
import cors from "cors";

import { ExpressAdapter } from "./infra/http/express-adapter";

import { Registry } from "./infra/di/registry";
import { Mediator } from "./infra/mediator/mediator";
import { OrderGatewayHTTP } from "./infra/gateway/order-gateway";
import { Book } from "./domain/book";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";
import { InitHTTPInterfaces } from "./interface/http";
import { InitQueueConsumer } from "./interface/queue";

const PORT = 4158;

async function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const httpServer = new ExpressAdapter();
  const queue = new RabbitMQAdapter();

  await queue.connect();

  await queue.setup("order.events", "matching-engine.order.placed", {
    routingKey: "order.placed",
    type: "topic"
  });

  await queue.setup("matching-engine.events", "order.matching-engine.order-filled", {
    routingKey: "matching-engine.order-filled",
    type: "topic"
  });


  Registry.getInstance().register("httpServer", httpServer);
  Registry.getInstance().register("mediator", new Mediator());
  Registry.getInstance().register("orderGateway", new OrderGatewayHTTP());
  Registry.getInstance().register("queue", queue);

  Registry.getInstance().register("book", new Book("BTC-USD"));

  new InitHTTPInterfaces();
  new InitQueueConsumer();

  httpServer.listen(PORT);
}

main();
