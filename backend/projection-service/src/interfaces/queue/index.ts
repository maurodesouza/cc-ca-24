import { AccountCreatedConsumer } from "./account-created-consumer";
import { BalanceUpdatedConsumer } from "./balance-updated-consumer";
import { OrderFilledConsumer } from "./order-filled-consumer";
import { OrderPlacedConsumer } from "./order-placed-consumer";

export class InitQueueConsumers {
  constructor() {
    new AccountCreatedConsumer()
    new BalanceUpdatedConsumer()
    new OrderPlacedConsumer()
    new OrderFilledConsumer()
  }
}
