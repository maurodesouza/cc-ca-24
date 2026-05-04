import { HTTPServer } from "../../application/http/http-server";
import { inject } from "../../infra/utils/registry";
import { DepthRepository } from "../../infra/repository/depth-repository";

export class DepthController {
  @inject("http-server")
  private readonly httpServer!: HTTPServer;
  @inject("depth-repository")
  private readonly depthRepository!: DepthRepository;

  constructor() {
    this.httpServer.route("get", "/depth/:marketId", async (_: any, params: any) => {
      const output = await this.depthRepository.getByMarketId(params.marketId);
      return output;
    });
  }
}
