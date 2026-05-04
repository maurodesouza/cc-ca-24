import { AccountController } from "./account-controller";
import { DepthController } from "./depth-controller";

export class InitHTTPInterfaces {
  constructor() {
    new AccountController();
    new DepthController();
  }
}
