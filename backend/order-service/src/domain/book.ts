import { Mediator } from "../infra/mediator/mediator";
import { OrderFilledEvent } from "./events/order-filled-event";
import { Order } from "./order";

export class Book extends Mediator {
  buys: Order[] = [];
  sells: Order[] = [];

  constructor (readonly marketId: string) {
    super();
  }

  async insert(order: Order) {
    if (order.isBuy()) {
      this.buys.push(order);
      this.buys.sort((a, b) => b.getPrice() - a.getPrice());
    } else {
      this.sells.push(order);
      this.sells.sort((a, b) => a.getPrice() - b.getPrice());
    }

    await this.execute()
  }

  async execute() {
     while(true) {
       const [highestBid] = this.buys;
       const [lowestAsk] = this.sells;

       if (!highestBid || !lowestAsk || highestBid.getPrice() < lowestAsk.getPrice()) break;

       const fillQuantity = Math.min(highestBid.getAvailableQuantity(), lowestAsk.getAvailableQuantity());
       const fillPrice = lowestAsk.getPrice();

       highestBid.fill(fillQuantity, fillPrice);
       lowestAsk.fill(fillQuantity, fillPrice);

       if (highestBid.isClosed()) this.buys.splice(0, 1);
       if (lowestAsk.isClosed()) this.sells.splice(0, 1);

       await this.notifyAll(new OrderFilledEvent(highestBid));
       await this.notifyAll(new OrderFilledEvent(lowestAsk));
     }
  }
}
