import { Depth } from "../models/depth";

export type DepthDTO = {
  marketId: string;
  side: string
  price: number;
  quantity: number;
};

export type DecrementDepthDTO = DepthDTO & {
  fillDiff: number;
};

export interface DepthRepository {
  increment(depth: DepthDTO): Promise<void>;
  decrement(depth: DecrementDepthDTO): Promise<void>;

  getByMarketId(marketId: string): Promise<DepthDTO[]>;
}

export class DepthRepositoryMongo implements DepthRepository {
  async increment(depth: DepthDTO): Promise<void> {
    console.log("increment depth", depth)

    await Depth.findOneAndUpdate({
      marketId: depth.marketId,
      price: depth.price,
      side: depth.side,
    }, {
      $inc: {
        quantity: depth.quantity
      }
    }, {
      upsert: true,
      setDefaultsOnInsert: true
    });
  }

  async decrement(depth: DecrementDepthDTO): Promise<void> {
    console.log("decrement depth", depth)

    await Depth.findOneAndUpdate({
      marketId: depth.marketId,
      price: depth.price,
      side: depth.side,
    }, {
      $inc: {
        quantity: -depth.fillDiff
      }
    });

    await Depth.deleteMany({
      marketId: depth.marketId,
      side: depth.side,
      $and: [
        { quantity: { $lte: 0 } }
      ]
    });
  }

  async getByMarketId(marketId: string): Promise<DepthDTO[]> {
    const depth = await Depth.find({ marketId });

    return depth
  }
}
