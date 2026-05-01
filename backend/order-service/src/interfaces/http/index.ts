import { BalanceController } from "./balance-controller";
import { OrderController } from "./order-controller";

export class InitHTTPInterfaces {
  constructor() {
    new BalanceController()
    new OrderController()
  }
}
