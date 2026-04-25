import express from "express";
import cors from "cors";

import { GetAccount } from "./application/use-cases/get-account";
import { Deposit } from "./application/use-cases/deposit";
import { Withdraw } from "./application/use-cases/withdraw";
import { PGPromiseAdapter } from "./infra/database/pg-promise-adapter";
import { AccountController } from "./infra/controllers/account-controller";
import { BalanceController } from "./infra/controllers/balance-controller";
import { ExpressAdapter } from "./infra/http/express-adapter";
import { AccountRepositoryDatabase } from "./infra/repository/account-repository";
import { WalletRepositoryDatabase } from "./infra/repository/wallet-repository";
import { SignUp } from "./application/use-cases/signup";

const PORT = 4156;

function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const pgPromiseAdapter = new PGPromiseAdapter();
  const accountRepository = new AccountRepositoryDatabase(pgPromiseAdapter);
  const walletRepository = new WalletRepositoryDatabase(pgPromiseAdapter);

  const signUp = new SignUp(accountRepository);
  const getAccount = new GetAccount(accountRepository, walletRepository);
  const deposit = new Deposit(walletRepository, accountRepository);
  const withdraw = new Withdraw(walletRepository, accountRepository);

  const expressAdapter = new ExpressAdapter();

  new AccountController(expressAdapter, signUp, getAccount);
  new BalanceController(expressAdapter, deposit, withdraw);

  expressAdapter.listen(PORT);
}

main();
