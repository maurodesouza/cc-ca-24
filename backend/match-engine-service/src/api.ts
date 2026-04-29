import express from "express";
import cors from "cors";

import { ExpressAdapter } from "./infra/http/express-adapter";

import { Registry } from "./infra/di/registry";
import { Mediator } from "./infra/mediator/mediator";
import { BookController } from "./infra/controllers/book-controller";
import { OrderGatewayHTTP } from "./infra/gateway/order-gateway";
import { Book } from "./domain/book";


const PORT = 4158;

function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const httpServer = new ExpressAdapter();

  Registry.getInstance().register("httpServer", httpServer);
  Registry.getInstance().register("mediator", new Mediator());
  Registry.getInstance().register("orderGateway", new OrderGatewayHTTP());

  Registry.getInstance().register("book", new Book("BTC-USD"));

  new BookController();

  httpServer.listen(PORT);
}

main();
