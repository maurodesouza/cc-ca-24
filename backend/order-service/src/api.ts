import express from "express";
import cors from "cors";

import { Deposit } from "./application/use-cases/deposit";
import { Withdraw } from "./application/use-cases/withdraw";
import { PGPromiseAdapter } from "./infra/database/pg-promise-adapter";
import { BalanceController } from "./infra/controllers/balance-controller";
import { ExpressAdapter } from "./infra/http/express-adapter";
import { WalletRepositoryORM } from "./infra/repository/wallet-repository";
import { Registry } from "./infra/di/registry";
import { ORM } from "./infra/orm/orm";
import { Mediator } from "./infra/mediator/mediator";
import { OrderController } from "./infra/controllers/order-controller";
import { UpdateOrder } from "./application/use-cases/update-order";
import { GetOrder } from "./application/use-cases/get-order";
import { OrderRepositoryORM } from "./infra/repository/order-repository";
import { PlaceOrder } from "./application/use-cases/place-order";
import { AccountGatewayHTTP } from "./infra/gateway/account-gateway";
import { MatchEngineGatewayHTTP } from "./infra/gateway/match-engine-gateway";

const PORT = 4157;

function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const httpServer = new ExpressAdapter();

  Registry.getInstance().register("httpServer", httpServer);
  Registry.getInstance().register("orm", new ORM());

  Registry.getInstance().register("mediator", new Mediator());

  Registry.getInstance().register("databaseConnection", new PGPromiseAdapter());
  Registry.getInstance().register("walletRepository", new WalletRepositoryORM());
  Registry.getInstance().register("accountGateway", new AccountGatewayHTTP());
  Registry.getInstance().register("matchEngineGateway", new MatchEngineGatewayHTTP());
  Registry.getInstance().register("orderRepository", new OrderRepositoryORM());

  Registry.getInstance().register("deposit", new Deposit());
  Registry.getInstance().register("withdraw", new Withdraw());
  Registry.getInstance().register("getOrder", new GetOrder());
  Registry.getInstance().register("updateOrder", new UpdateOrder());
  Registry.getInstance().register("placeOrder", new PlaceOrder());

  new BalanceController();
  new OrderController();

  httpServer.listen(PORT);
}

main();
