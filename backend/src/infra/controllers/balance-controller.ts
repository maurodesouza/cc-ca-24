import { Deposit } from "../../application/use-cases/deposit";
import { Withdraw } from "../../application/use-cases/withdraw";
import { HTTPServer } from "../../application/http/http-server";

export class BalanceController {
  constructor(readonly httpServer: HTTPServer, readonly deposit: Deposit, readonly withdraw: Withdraw) {
    httpServer.route("post", "/deposit", async (body: any) => {
      const output = await this.deposit.execute(body);
      return output;
    });

    httpServer.route("post", "/withdraw", async (body: any) => {
      const output = await this.withdraw.execute(body);
      return output;
    });
  }
}
