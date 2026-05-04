import { Order } from "../../domain/order";
import { WalletRepository } from "../../infra/repository/wallet-repository";
import { OrderRepository } from "../../infra/repository/order-repository";
import { inject } from "../../infra/utils/registry";
import { AccountReferenceRepository } from "../../infra/repository/account-reference-repository";
import { WalletEventMapper } from "../mappers/wallet-event-mapper";
import { Queue } from "../queue/queue";
import { OrderEventMapper } from "../mappers/order-event-mapper";

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
  @inject("queue")
  private readonly queue!: Queue;

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

    await Promise.all([
      this.orderRepository.save(order),
      this.walletRepository.update(wallet),
    ]);

    await Promise.all([
      this.queue.publish("order.events", OrderEventMapper.toPayload(order), { routingKey: "order.placed" }),
      this.queue.publish("balance.events", WalletEventMapper.toPayload(wallet), { routingKey: "balance.updated" }),
    ]);

    return {
      orderId: order.getOrderId(),
    };
  }
}
