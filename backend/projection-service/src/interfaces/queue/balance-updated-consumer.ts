import { Queue } from "../../application/queue/queue";
import { AccountWithBalanceRepository } from "../../infra/repository/account-with-balance";
import { inject } from "../../infra/utils/registry";

export class BalanceUpdatedConsumer {
  @inject("queue")
  private readonly queue!: Queue;
  @inject("account-with-balance-repository")
  private readonly accountWithBalanceRepository!: AccountWithBalanceRepository;

  constructor() {
    this.queue.consume("projection.balance.updated", this.handle.bind(this));
  }

  async handle(message: any) {
    await this.accountWithBalanceRepository.updateBalances(message.accountId, message.balances);
  }
}
