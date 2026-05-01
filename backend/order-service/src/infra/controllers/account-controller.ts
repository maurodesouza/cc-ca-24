import { inject } from "../utils/registry";
import { RabbitMQAdapter } from "../queue/rabbitmq-adapter";
import { AccountReferenceRepository } from "../repository/account-reference-repository";

export class AccountController {
  @inject("queue")
  private readonly queue!: RabbitMQAdapter;
  @inject("accountReferenceRepository")
  private readonly accountReferenceRepository!: AccountReferenceRepository;

  constructor() {
    this.queue.consume("order.account.created", async (message: any) => {
      const input = message.accountId
      await this.accountReferenceRepository.save(input);
    });
  }
}
