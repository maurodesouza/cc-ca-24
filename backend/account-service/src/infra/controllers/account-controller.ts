import { HTTPServer } from "../../application/http/http-server";
import { GetAccount } from "../../application/use-cases/get-account";
import { SignUp } from "../../application/use-cases/signup";
import { inject } from "../utils/registry";

export class AccountController {
  @inject("httpServer")
  private readonly httpServer!: HTTPServer;
  @inject("signUp")
  private readonly signUp!: SignUp;
  @inject("getAccount")
  private readonly getAccount!: GetAccount;

  constructor() {
    this.httpServer.route("post", "/signup", async (body: any) => {
      const output = await this.signUp.execute(body);
      return output;
    });

    this.httpServer.route("get", "/accounts/:accountId", async (_: any, params: any) => {
      const output = await this.getAccount.execute(params.accountId);
      return output;
    });
  }
}
