import { AccountRepository } from "../../infra/repository/account-repository";
import { sendEmail } from "../../infra/mail/mailer";
import { Account } from "../../domain/account";

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
  accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  async execute(input: Input): Promise<Output> {
    const account = Account.create(
      input.name,
      input.email,
      input.password,
      input.document
    );

    await this.accountRepository.save(account);

    await sendEmail({
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

    return output
  }
}



