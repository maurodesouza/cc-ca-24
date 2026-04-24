import { HTTPServer } from "./http-server";
import { SignUp } from "./signup";
import { GetAccount } from "./get-account";

export class AccountController {
  constructor(readonly httpServer: HTTPServer, readonly signUp: SignUp, readonly getAccount: GetAccount) {
    httpServer.route("post", "/signup", async (body: any) => {
      const output = await this.signUp.execute(body);
      return output;
    });

    httpServer.route("get", "/accounts/:accountId", async (_: any, params: any) => {
      const output = await this.getAccount.execute(params.accountId);
      return output;
    });
  }
}
