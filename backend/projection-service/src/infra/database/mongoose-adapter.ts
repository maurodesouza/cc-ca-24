import mongoose from "mongoose";
import { DatabaseConnection } from "../../application/database/database-connection";

export class MongooseAdapter implements DatabaseConnection {
  private connection: mongoose.Mongoose | undefined;

  async connect(): Promise<void> {

    try {
      this.connection = await mongoose.connect('mongodb://root:example@localhost:27017/app?authSource=admin');
    } catch (error) {
      console.error("[mongoose]: failed to connect to mongodb", error);
    }
  }

  async close(): Promise<void> {
    if (!this.connection) throw new Error("[mongoose]: connection not established");
    await this.connection.connection.close();
  }
}
