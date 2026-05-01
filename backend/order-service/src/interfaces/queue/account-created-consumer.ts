import { RabbitMQAdapter } from "../../infra/queue/rabbitmq-adapter";
import { AccountReferenceRepository } from "../../infra/repository/account-reference-repository";
import { inject } from "../../infra/utils/registry";

export class AccountCreatedConsumer {
  @inject("queue")
  private readonly queue!: RabbitMQAdapter;
  @inject("accountReferenceRepository")
  private readonly accountReferenceRepository!: AccountReferenceRepository;

  constructor() {
    this.queue.consume("order.account.created", this.handle.bind(this));
  }

  async handle(message: any) {
    await this.accountReferenceRepository.save(message.accountId);
  }
}
