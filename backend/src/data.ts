import pgPromise from "pg-promise";

export async function saveAccount(account: any) {
  const connection = pgPromise()("postgres://postgres:postgres@localhost:6543/app");

  await connection.query("insert into ccca.account (account_id, name, email, password, document) values ($1, $2, $3, $4, $5)", [account.accountId, account.name, account.email, account.password, account.document]);

  connection.$pool.end();
}

export async function getAccountById(accountId: string) {
  const connection = pgPromise()("postgres://postgres:postgres@localhost:6543/app");
  const [account] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);

  connection.$pool.end();

  return account;
}
