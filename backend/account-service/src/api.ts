import express from "express";
import cors from "cors";

import { ExpressAdapter } from "./infra/http/express-adapter";
import { PGPromiseAdapter } from "./infra/database/pg-promise-adapter";

import { ORM } from "./infra/orm/orm";
import { Registry } from "./infra/utils/registry";
import { AccountController } from "./interfaces/http/account-controller";
import { AccountRepositoryORM } from "./infra/repository/account-repository";

import { SignUp } from "./application/use-cases/signup";
import { GetAccount } from "./application/use-cases/get-account";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";
import { ResendAdapter } from "./infra/mail/resend-adapter";

const PORT = 4156;

async function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const httpServer = new ExpressAdapter();

  const queue = new RabbitMQAdapter();

  await queue.connect();
  await queue.setup("account.events", "order.account.created", { routingKey: "account.created", type: "topic" });
  await queue.setup("account.events", "projection.account.created", { routingKey: "account.created", type: "topic" });

  Registry.getInstance().register("httpServer", httpServer);
  Registry.getInstance().register("databaseConnection", new PGPromiseAdapter());
  Registry.getInstance().register("queue", queue);
  Registry.getInstance().register("mailer", new ResendAdapter());

  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("accountRepository", new AccountRepositoryORM());

  Registry.getInstance().register("signUp", new SignUp());
  Registry.getInstance().register("getAccount", new GetAccount());

  new AccountController();

  httpServer.listen(PORT);
}

main();
