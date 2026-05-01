import { HTTPServer } from "../../application/http/http-server";
import { GetAccount } from "../../application/use-cases/get-account";
import { SignUp } from "../../application/use-cases/signup";
import { inject } from "../../infra/utils/registry";

export class AccountController {
  @inject("httpServer")
  private readonly httpServer!: HTTPServer;
  @inject("signUp")
  private readonly signUp!: SignUp;
  @inject("getAccount")
  private readonly getAccount!: GetAccount;

  constructor() {
    this.httpServer.route("post", "/signup", async (body: any) => {
      const input = {
        name: body.name,
        email: body.email,
        document: body.document,
        password: body.password
      }

      const output = await this.signUp.execute(input);
      return output;
    });

    this.httpServer.route("get", "/accounts/:accountId", async (_: any, params: any) => {
      const output = await this.getAccount.execute(params.accountId);
      return output;
    });
  }
}
