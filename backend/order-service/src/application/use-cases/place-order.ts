import { Order } from "../../domain/order";
import { WalletRepository } from "../../infra/repository/wallet-repository";
import { OrderRepository } from "../../infra/repository/order-repository";
import { inject } from "../../infra/utils/registry";
import { Mediator } from "../../infra/utils/mediator";
import { OrderPlacedEvent } from "../../domain/events/order-placed-event";
import { AccountReferenceRepository } from "../../infra/repository/account-reference-repository";

type Input = {
  accountId: string;
  marketId: string;
  side: string;
  quantity: number;
  price: number
}

type Output = {
  orderId: string;
}

export class PlaceOrder {
  @inject("walletRepository")
  private readonly walletRepository!: WalletRepository;
  @inject("accountReferenceRepository")
  private readonly accountReferenceRepository!: AccountReferenceRepository;
  @inject("orderRepository")
  private readonly orderRepository!: OrderRepository;
  @inject("mediator")
  private readonly mediator!: Mediator;

  async execute(input: Input): Promise<Output> {
    const accountExists = await this.accountReferenceRepository.exist(input.accountId);
    if (!accountExists) throw new Error("Account not found");

    const wallet = await this.walletRepository.getByAccountId(input.accountId);

    const order = Order.create(
      input.accountId,
      input.marketId,
      input.side,
      input.quantity,
      input.price,
    );

    const blocked = wallet.blockOrder(order);
    if (!blocked) throw new Error("Insufficient funds");

    await this.orderRepository.save(order);
    await this.walletRepository.update(wallet);
    await this.mediator.notifyAll(new OrderPlacedEvent(order));

    return {
      orderId: order.getOrderId(),
    };
  }
}
