import express from "express";
import cors from "cors";

import { ExpressAdapter } from "./infra/http/express-adapter";

import { Registry } from "./infra/utils/registry";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";
import { MongooseAdapter } from "./infra/database/mongoose-adapter";
import { AccountWithBalanceRepositoryMongo } from "./infra/repository/account-with-balance";
import { InitHTTPInterfaces } from "./interfaces/http";
import { InitQueueConsumers } from "./interfaces/queue";

const PORT = 4159;

async function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const queue = new RabbitMQAdapter();
  const httpServer = new ExpressAdapter()
  const mongoConnection = new MongooseAdapter();

  await Promise.all([
    queue.connect(),
    mongoConnection.connect()
  ]);

  await Promise.all([
    queue.setup("account.events", "order.account.created", { routingKey: "account.created", type: "topic" }),
    queue.setup("account.events", "projection.account.created", { routingKey: "account.created", type: "topic" }),
    queue.setup("balance.events", "projection.balance.updated", { routingKey: "balance.updated", type: "topic" }),
  ]);

  Registry.getInstance().register("http-server", httpServer);
  Registry.getInstance().register("mongo-connection", mongoConnection);
  Registry.getInstance().register("queue", queue);

  Registry.getInstance().register("account-with-balance-repository", new AccountWithBalanceRepositoryMongo());

  new InitHTTPInterfaces()
  new InitQueueConsumers()

  httpServer.listen(PORT);
}

main();
