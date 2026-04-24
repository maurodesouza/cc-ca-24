import { Deposit } from "./deposit";
import { HTTPServer } from "./http-server";

export class BalanceController {
  constructor(readonly httpServer: HTTPServer, readonly deposit: Deposit, readonly withdraw: Deposit) {
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
