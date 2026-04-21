import express from "express";
import pgp from "pg-promise";
import crypto from "crypto";

const PORT = 3000;

function main() {
  const app = express();
  app.use(express.json());

  const connection = pgp()("postgres://postgres:postgres@localhost:6543/app");


  app.post("/signup", async (req, res) => {
    const account = {
      accountId: crypto.randomUUID(),
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      document: req.body.document
    }

    await connection.query("insert into ccca.account (account_id, name, email, password, document) values ($1, $2, $3, $4, $5)", [account.accountId, account.name, account.email, account.password, account.document]);

    res.status(201).json({ accountId: account.accountId });
  });

  app.get("/accounts/:accountId", async (req, res) => {

    console.log("Getting account", req.params.accountId);
    const accounts = await connection.query("select * from ccca.account");
    console.log("Accounts", accounts);

    const [account] = await connection.query("select * from ccca.account where account_id = $1", [req.params.accountId]);

    console.log("Account", account);
    res.status(200).json(account);
  });

  app.listen(PORT, () => console.log(`🚀 server started on port ${PORT}`));
}

main();
