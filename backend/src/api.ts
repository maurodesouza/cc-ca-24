import express from "express";
import cors from "cors";

import { SignUp } from "./signup";
import { GetAccount } from "./get-account";
import { Deposit } from "./deposit";
import { Withdraw } from "./withdraw";
import { AccountDAODatabase } from "./account-DAO";
import { FundDAODatabase } from "./fund-DAO";

const PORT = 4156;

function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const accountDAO = new AccountDAODatabase();
  const fundDAO = new FundDAODatabase();
  const signUp = new SignUp(accountDAO);
  const getAccount = new GetAccount(accountDAO);
  const deposit = new Deposit(fundDAO, accountDAO);
  const withdraw = new Withdraw(fundDAO, accountDAO);

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
      const output = await deposit.execute(body);

      return res.status(201).json({ fundId: output.fundId });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.post("/withdraw", async (req, res) => {
    try {
      const body = req.body;
      const output = await withdraw.execute(body);

      return res.status(201).json({ fundId: output.fundId });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.listen(PORT, () => console.log(`🚀 server started on port ${PORT}`));
}

main();
