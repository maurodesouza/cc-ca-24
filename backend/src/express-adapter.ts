import express from "express";
import cors from "cors";

import { HTTPServer } from "./http-server";

export class ExpressAdapter implements HTTPServer {
  app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(cors());
  }

  route(method: "get" | "post", url: string, callback: Function): void {
    this.app[method](url, async (req: express.Request, res: express.Response) => {
      const { body, params } = req;

      try {
        const output = await callback(body, params);
        const status = method === "post" ? 201 : 200;

        res.status(status).json(output);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    });
  }

  listen(port: number): void {
    this.app.listen(port, () => console.log(`🚀 server started on port ${port}`));
  }
}
