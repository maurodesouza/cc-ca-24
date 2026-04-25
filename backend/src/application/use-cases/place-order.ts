import { Order } from "../../domain/order";
import { WalletRepository } from "../../infra/repository/wallet-repository";
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
  walletRepository: WalletRepository;
  accountRepository: AccountRepository;
  orderRepository: OrderRepository;

  constructor(walletRepository: WalletRepository, accountRepository: AccountRepository, orderRepository: OrderRepository) {
    this.walletRepository = walletRepository;
    this.accountRepository = accountRepository;
    this.orderRepository = orderRepository;
  }

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


    while (true) {
      const highestBid = await this.orderRepository.getHighestBid(input.marketId);
      const lowestAsk = await this.orderRepository.getLowestAsk(input.marketId);

      if (!highestBid || !lowestAsk || highestBid.getPrice() < lowestAsk.getPrice()) break;

      const fillQuantity = Math.min(highestBid.getQuantity(), lowestAsk.getQuantity());
      const fillPrice = (highestBid.getTimestamp() > lowestAsk.getTimestamp()) ? lowestAsk.getPrice() : highestBid.getPrice();

      highestBid.fill(fillQuantity, fillPrice);
      lowestAsk.fill(fillQuantity, fillPrice);

      await this.orderRepository.update(highestBid);
      await this.orderRepository.update(lowestAsk);
    }

    return {
      orderId: order.getOrderId(),
    };
  }
}
