import express from "express";
import cors from "cors";

import { GetAccount } from "./application/use-cases/get-account";
import { Deposit } from "./application/use-cases/deposit";
import { Withdraw } from "./application/use-cases/withdraw";
import { PGPromiseAdapter } from "./infra/database/pg-promise-adapter";
import { AccountController } from "./infra/controllers/account-controller";
import { BalanceController } from "./infra/controllers/balance-controller";
import { ExpressAdapter } from "./infra/http/express-adapter";
import { AccountRepositoryORM } from "./infra/repository/account-repository";
import { WalletRepositoryDatabase } from "./infra/repository/wallet-repository";
import { SignUp } from "./application/use-cases/signup";
import { Registry } from "./infra/di/registry";
import { ORM } from "./infra/orm/orm";

const PORT = 4156;

function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());


  const httpServer = new ExpressAdapter();

  Registry.getInstance().register("httpServer", httpServer);
  Registry.getInstance().register("orm", new ORM());

  Registry.getInstance().register("databaseConnection", new PGPromiseAdapter());
  Registry.getInstance().register("accountRepository", new AccountRepositoryORM());
  Registry.getInstance().register("walletRepository", new WalletRepositoryDatabase());

  Registry.getInstance().register("signUp", new SignUp());
  Registry.getInstance().register("deposit", new Deposit());
  Registry.getInstance().register("withdraw", new Withdraw());
  Registry.getInstance().register("getAccount", new GetAccount());

  new AccountController();
  new BalanceController();

  httpServer.listen(PORT);
}

main();
