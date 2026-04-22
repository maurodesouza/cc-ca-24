import express from "express";
import pgp from "pg-promise";
import crypto from "crypto";
import { isValidName } from "./is-valid-name";
import { isValidEmail } from "./is-valid-email";
import { isValidPassword } from "./is-valid-password";
import { isValidCpf } from "./is-valid-cpf";

const PORT = 3000;

function main() {
  const app = express();
  app.use(express.json());

  const connection = pgp()("postgres://postgres:postgres@localhost:6543/app");


  app.post("/signup", async (req, res) => {
    if (!isValidName(req.body.name)) {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (!isValidEmail(req.body.email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!isValidPassword(req.body.password)) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (!isValidCpf(req.body.document)) {
      return res.status(400).json({ message: "Invalid document" });
    }

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
    const [account] = await connection.query("select * from ccca.account where account_id = $1", [req.params.accountId]);

    res.status(200).json(account);
  });

  app.listen(PORT, () => console.log(`🚀 server started on port ${PORT}`));
}

main();
