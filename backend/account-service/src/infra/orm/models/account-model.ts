import { Account } from "../../../domain/account";
import { column, model, Model } from "../orm";

@model("ccca", "account")
export class AccountModel extends Model {
  @column("account_id", true)
  accountId!: string
  @column("name")
  name!: string
  @column("email")
  email!: string
  @column("document")
  document!: string
  @column("password")
  password!: string

  constructor(accountId: string, name: string, email: string, password: string, document: string) {
    super()
    this.accountId = accountId
    this.name = name
    this.email = email
    this.password = password
    this.document = document
  }

  static fromEntity(account: Account) {
    return new AccountModel(
      account.getAccountId(),
      account.getName(),
      account.getEmail(),
      account.getPassword(),
      account.getDocument()
    )
  }

  toEntity() {
    return new Account(
      this.accountId,
      this.name,
      this.email,
      this.password,
      this.document,
    )
  }
}
