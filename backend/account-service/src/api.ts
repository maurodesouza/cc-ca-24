import express from "express";
import cors from "cors";

import { ExpressAdapter } from "./infra/http/express-adapter";
import { PGPromiseAdapter } from "./infra/database/pg-promise-adapter";

import { ORM } from "./infra/orm/orm";
import { Registry } from "./infra/utils/registry";
import { Mediator } from "./infra/utils/mediator";
import { AccountController } from "./infra/controllers/account-controller";
import { AccountRepositoryORM } from "./infra/repository/account-repository";

import { SignUp } from "./application/use-cases/signup";
import { GetAccount } from "./application/use-cases/get-account";
import { ResendAdapter } from "./infra/mail/resend-adapter";

const PORT = 4156;

function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const httpServer = new ExpressAdapter();

  Registry.getInstance().register("httpServer", httpServer);
  Registry.getInstance().register("databaseConnection", new PGPromiseAdapter());
  Registry.getInstance().register("mailer", new ResendAdapter());

  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("mediator", new Mediator());
  Registry.getInstance().register("accountRepository", new AccountRepositoryORM());

  Registry.getInstance().register("signUp", new SignUp());
  Registry.getInstance().register("getAccount", new GetAccount());

  new AccountController();

  httpServer.listen(PORT);
}

main();
