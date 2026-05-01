import { AccountRepository } from "../../infra/repository/account-repository";
import { Account } from "../../domain/account";
import { inject } from "../../infra/utils/registry";
import { RabbitMQAdapter } from "../../infra/queue/rabbitmq-adapter";
import { ResendAdapter } from "../../infra/mail/resend-adapter";

type Input = {
  name: string;
  email: string;
  password: string;
  document: string;
}

type Output = {
  accountId: string;
  name: string;
  email: string;
  password: string;
  document: string;
}

export class SignUp {
  @inject("accountRepository")
  private readonly accountRepository!: AccountRepository;
  @inject("queue")
  private readonly queue!: RabbitMQAdapter;
  @inject("mailer")
  private readonly mailer!: ResendAdapter;

  async execute(input: Input): Promise<Output> {
    const account = Account.create(
      input.name,
      input.email,
      input.password,
      input.document
    );

    await this.accountRepository.save(account);

    await this.mailer.send({
      to: account.getEmail(),
      subject: "Account created",
      body: "Your account has been created"
    });

    const output = {
      accountId: account.getAccountId(),
      name: account.getName(),
      email: account.getEmail(),
      password: account.getPassword(),
      document: account.getDocument(),
    }

    await this.queue.publish("account.events", output, { routingKey: "account.created" });

    return output
  }
}



