import express from "express";
import cors from "cors";

import { SignUp } from "./signup";
import { GetAccount } from "./get-account";
import { Deposit } from "./deposit";
import { Withdraw } from "./withdraw";
import { AccountRepositoryDatabase } from "./account-repository";
import { PGPromiseAdapter } from "./pg-promise-adapter";
import { AccountController } from "./account-controller";
import { BalanceController } from "./balance-controller";
import { ExpressAdapter } from "./express-adapter";

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

  const expressAdapter = new ExpressAdapter();

  new AccountController(expressAdapter, signUp, getAccount);
  new BalanceController(expressAdapter, deposit, withdraw);

  expressAdapter.listen(PORT);
}

main();
