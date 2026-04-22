import express from "express";
import cors from "cors";

import { getAccount, signup } from "./service";

const PORT = 4156;

function main() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.post("/signup", async (req, res) => {
    try {
      const body = req.body;
      const output = await signup(body);

      return res.status(201).json({ accountId: output.accountId });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.get("/accounts/:accountId", async (req, res) => {
    try {
      const params = req.params;
      const output = await getAccount(params.accountId);

      return res.status(200).json(output);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.listen(PORT, () => console.log(`🚀 server started on port ${PORT}`));
}

main();
