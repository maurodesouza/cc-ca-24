import { Order } from "../../domain/order";
import { WalletRepository } from "../../infra/repository/wallet-repository";
import { AccountRepository } from "../../infra/repository/account-repository";
import { OrderRepository } from "../../infra/repository/order-repository";
import { inject } from "../../infra/di/registry";
import { Mediator } from "../../infra/mediator/mediator";
import { OrderPlacedEvent } from "../../domain/events/order-placed-event";

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
  @inject("accountRepository")
  private readonly accountRepository!: AccountRepository;
  @inject("orderRepository")
  private readonly orderRepository!: OrderRepository;
  @inject("mediator")
  private readonly mediator!: Mediator;

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository.getById(input.accountId);
    if (!account) throw new Error("Account not found");

    const wallet = await this.walletRepository.getByAccountId(account.getAccountId());

    const order = Order.create(
      account.getAccountId(),
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
