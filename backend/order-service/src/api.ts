import express from "express";
import cors from "cors";

// Application - Use Cases
import { Deposit } from "./application/use-cases/deposit";
import { Withdraw } from "./application/use-cases/withdraw";
import { GetOrder } from "./application/use-cases/get-order";
import { UpdateOrder } from "./application/use-cases/update-order";
import { PlaceOrder } from "./application/use-cases/place-order";

// Controllers
import { InitHTTPInterfaces } from "./interfaces/http";
import { InitQueueConsumer } from "./interfaces/queue";

// Infrastructure - Repositories
import { WalletRepositoryORM } from "./infra/repository/wallet-repository";
import { OrderRepositoryORM } from "./infra/repository/order-repository";
import { AccountReferenceRepositoryDatabase } from "./infra/repository/account-reference-repository";

// Infrastructure - Gateways
import { MatchEngineGatewayHTTP } from "./infra/gateway/match-engine-gateway";
import { PaymentAGatewayHTTP } from "./infra/gateway/payment-A-gateway";
import { PaymentBGatewayHTTP } from "./infra/gateway/payment-B-gateway";
import { PaymentCGatewayHTTP } from "./infra/gateway/payment-C-gateway";
import { PaymentDGatewayHTTP } from "./infra/gateway/payment-D-gateway";

// Infrastructure - Database
import { PGPromiseAdapter } from "./infra/database/pg-promise-adapter";

// Infrastructure - HTTP
import { ExpressAdapter } from "./infra/http/express-adapter";

// Infrastructure - Queue
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";

// Infrastructure - Utils
import { Registry } from "./infra/utils/registry";
import { ORM } from "./infra/orm/orm";


const PORT = 4157;

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

  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("queue", queue);
  Registry.getInstance().register("httpServer", httpServer);

  Registry.getInstance().register("databaseConnection", new PGPromiseAdapter());
  Registry.getInstance().register("walletRepository", new WalletRepositoryORM());
  Registry.getInstance().register("matchEngineGateway", new MatchEngineGatewayHTTP());
  Registry.getInstance().register("orderRepository", new OrderRepositoryORM());
  Registry.getInstance().register("accountReferenceRepository", new AccountReferenceRepositoryDatabase());

  Registry.getInstance().register("paymentAGateway", new PaymentAGatewayHTTP());
  Registry.getInstance().register("paymentBGateway", new PaymentBGatewayHTTP());
  Registry.getInstance().register("paymentCGateway", new PaymentCGatewayHTTP());
  Registry.getInstance().register("paymentDGateway", new PaymentDGatewayHTTP());

  Registry.getInstance().register("deposit", new Deposit());
  Registry.getInstance().register("withdraw", new Withdraw());
  Registry.getInstance().register("getOrder", new GetOrder());
  Registry.getInstance().register("updateOrder", new UpdateOrder());
  Registry.getInstance().register("placeOrder", new PlaceOrder());

  new InitHTTPInterfaces()
  new InitQueueConsumer()

  httpServer.listen(PORT);
}

main();
