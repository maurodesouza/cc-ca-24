import { AccountCreatedConsumer } from "./account-created-consumer";
import { MatchingEngineOrderFilledConsumer } from "./matching-engine-order-filled-consumer";

export class InitQueueConsumer {
  constructor() {
    new AccountCreatedConsumer()
    new MatchingEngineOrderFilledConsumer
  }
}
