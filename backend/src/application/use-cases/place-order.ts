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

    const [mainAssets, paymentAsset] = input.marketId.split("-");

    const isBuy = input.side === "buy";

    const assetId = isBuy ? paymentAsset : mainAssets;
    const quantity = isBuy ? input.quantity * input.price : input.quantity;
    const balance = account.getBalance(assetId);
    if (balance < quantity) throw new Error("Insufficient balance");

    const order = Order.create(
      input.accountId,
      input.marketId,
      input.side,
      input.quantity,
      input.price,
    );

    await this.orderRepository.save(order);

    return {
      orderId: order.getOrderId(),
    };
  }
}
