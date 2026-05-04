import { AccountCreatedConsumer } from "./account-created-consumer";
import { BalanceUpdatedConsumer } from "./balance-updated-consumer";

export class InitQueueConsumers {
  constructor() {
    new AccountCreatedConsumer()
    new BalanceUpdatedConsumer()
  }
}
