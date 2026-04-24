import express from "express";
import cors from "cors";

import { SignUp } from "./signup";
import { GetAccount } from "./get-account";
import { Deposit } from "./deposit";
import { Withdraw } from "./withdraw";
import { AccountRepositoryDatabase } from "./account-repository";
import { PGPromiseAdapter } from "./pg-promise-adapter";

const PORT = 4156;

function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const pgPromiseAdapter = new PGPromiseAdapter();
  const accountRepository = new AccountRepositoryDatabase(pgPromiseAdapter);
  const signUp = new SignUp(accountRepository);
  const getAccount = new GetAccount(accountRepository);
  const deposit = new Deposit(accountRepository);
  const withdraw = new Withdraw(accountRepository);

  app.post("/signup", async (req, res) => {
    try {
      const body = req.body;
      const output = await signUp.execute(body);

      return res.status(201).json({ accountId: output.accountId });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.get("/accounts/:accountId", async (req, res) => {
    try {
      const params = req.params;
      const output = await getAccount.execute(params.accountId);

      return res.status(200).json(output);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.post("/deposit", async (req, res) => {
    try {
      const body = req.body;
      await deposit.execute(body);

      return res.status(201).json();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.post("/withdraw", async (req, res) => {
    try {
      const body = req.body;
      await withdraw.execute(body);

      return res.status(201).json();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.listen(PORT, () => console.log(`🚀 server started on port ${PORT}`));
}

main();
