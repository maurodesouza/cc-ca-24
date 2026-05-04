import { AccountCreatedConsumer } from "./account-created-consumer";

export class InitQueueConsumers {
  constructor() {
    new AccountCreatedConsumer()
  }
}
