import { Order } from "../../domain/order";
import { AccountRepository } from "../../infra/repository/account-repository";
import { OrderRepository } from "../../infra/repository/order-repository";

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
  accountRepository: AccountRepository;
  orderRepository: OrderRepository;

  constructor(accountRepository: AccountRepository, orderRepository: OrderRepository) {
    this.accountRepository = accountRepository;
    this.orderRepository = orderRepository;
  }

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository.getById(input.accountId);

    if (!account) throw new Error("Account not found");

    const order = Order.create(
      input.accountId,
      input.marketId,
      input.side,
      input.quantity,
      input.price,
    );

    const blocked = account.blockOrder(order);
    if (!blocked) throw new Error("Insufficient funds");

    await this.orderRepository.save(order);
    await this.accountRepository.update(account);

    return {
      orderId: order.getOrderId(),
    };
  }
}
