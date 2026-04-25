import { Deposit } from "../../application/use-cases/deposit";
import { Withdraw } from "../../application/use-cases/withdraw";
import { HTTPServer } from "../../application/http/http-server";
import { inject } from "../di/registry";

export class BalanceController {
  @inject("httpServer")
  private readonly httpServer!: HTTPServer;
  @inject("deposit")
  private readonly deposit!: Deposit;
  @inject("withdraw")
  private readonly withdraw!: Withdraw;

  constructor() {
    this.httpServer.route("post", "/deposit", async (body: any) => {
      const output = await this.deposit.execute(body);
      return output;
    });

    this.httpServer.route("post", "/withdraw", async (body: any) => {
      const output = await this.withdraw.execute(body);
      return output;
    });
  }
}
