import express from "express";
import cors from "cors";

import { AccountService } from "./account-service";
import { AccountDAODatabase } from "./account-DAO";
import { FundService } from "./fund-service";
import { FundDAODatabase } from "./fund-DAO";

const PORT = 4156;

function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const accountDAO = new AccountDAODatabase();
  const fundDAO = new FundDAODatabase();
  const accountService = new AccountService(accountDAO);
  const fundService = new FundService(fundDAO, accountDAO);

  app.post("/signup", async (req, res) => {
    try {
      const body = req.body;
      const output = await accountService.signup(body);

      return res.status(201).json({ accountId: output.accountId });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.get("/accounts/:accountId", async (req, res) => {
    try {
      const params = req.params;
      const output = await accountService.getAccount(params.accountId);

      return res.status(200).json(output);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.post("/deposit", async (req, res) => {
    try {
      const body = req.body;
      const output = await fundService.deposit(body);

      return res.status(201).json({ fundId: output.fundId });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.post("/withdraw", async (req, res) => {
    try {
      const body = req.body;
      const output = await fundService.withdraw(body);

      return res.status(201).json({ fundId: output.fundId });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.listen(PORT, () => console.log(`🚀 server started on port ${PORT}`));
}

main();
