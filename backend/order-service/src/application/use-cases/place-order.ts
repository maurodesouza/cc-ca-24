import { Order } from "../../domain/order";
import { WalletRepository } from "../../infra/repository/wallet-repository";
import { OrderRepository } from "../../infra/repository/order-repository";
import { inject } from "../../infra/utils/registry";
import { AccountReferenceRepository } from "../../infra/repository/account-reference-repository";
import { RabbitMQAdapter } from "../../infra/queue/rabbitmq-adapter";

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
  private readonly queue!: RabbitMQAdapter;

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

    const payload = {
        orderId: order.getOrderId(),
        accountId: order.getAccountId(),
        marketId: order.getMarketId(),
        side: order.getSide(),
        quantity: order.getQuantity(),
        price: order.getPrice(),
        fillQuantity: order.getFillQuantity(),
        fillPrice: order.getFillPrice(),
        status: order.getStatus(),
        timestamp: order.getTimestamp(),
      };

    await this.queue.publish("order.events", payload, { routingKey: "order.placed" })

    return {
      orderId: order.getOrderId(),
    };
  }
}
