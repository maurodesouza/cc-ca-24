import { HTTPServer } from "../../application/http/http-server";
import { inject } from "../../infra/utils/registry";
import { AccountWithBalanceRepository } from "../../infra/repository/account-with-balance";

export class AccountController {
  @inject("http-server")
  private readonly httpServer!: HTTPServer;
  @inject("account-with-balance-repository")
  private readonly accountWithBalanceRepository!: AccountWithBalanceRepository;

  constructor() {
    this.httpServer.route("get", "/accounts/:accountId", async (_: any, params: any) => {
      const output = await this.accountWithBalanceRepository.getById(params.accountId);
      return output;
    });
  }
}
