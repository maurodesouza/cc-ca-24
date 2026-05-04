import { Queue } from "../../application/queue/queue";
import { AccountWithBalanceRepository } from "../../infra/repository/account-with-balance";
import { inject } from "../../infra/utils/registry";

export class AccountCreatedConsumer {
  @inject("queue")
  private readonly queue!: Queue;
  @inject("account-with-balance-repository")
  private readonly accountWithBalanceRepository!: AccountWithBalanceRepository;

  constructor() {
    this.queue.consume("projection.account.created", this.handle.bind(this));
  }

  async handle(message: any) {
    const input = {
      accountId: message.accountId,
      name: message.name,
      email: message.email,
      balance: [],
    };

    await this.accountWithBalanceRepository.save(input);
  }
}
