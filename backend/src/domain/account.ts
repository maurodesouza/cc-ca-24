import { UUID } from "./uuid";
import { Email } from "./email";
import { Password } from "./password";
import { Document } from "./document";
import { Name } from "./name";

export class Account {
  private accountId: UUID;
  private name: Name;
  private email: Email;
  private password: Password;
  private document: Document;

  constructor(
    accountId: string,
    name: string,
    email: string,
    password: string,
    document: string,
  ) {
    this.accountId = new UUID(accountId);
    this.name = new Name(name);
    this.email = new Email(email);
    this.password = new Password(password);
    this.document = new Document(document);
  }

  static create(name: string, email: string, password: string, document: string) {
    const accountId = UUID.create();
    return new Account(accountId.value, name, email, password, document);
  }

  getName() {
    return this.name.value;
  }

  getAccountId() {
    return this.accountId.value;
  }

  getEmail() {
    return this.email.value;
  }

  getPassword() {
    return this.password.value;
  }

  getDocument() {
    return this.document.value;
  }
}
