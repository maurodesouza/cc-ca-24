import { OrderFilledPublisher } from "./order-filled-publisher";
import { OrderPlacedConsumer } from "./order-placed-consumer";

export class InitQueueConsumer {
  constructor() {
    new OrderPlacedConsumer()
    new OrderFilledPublisher()
  }
}
