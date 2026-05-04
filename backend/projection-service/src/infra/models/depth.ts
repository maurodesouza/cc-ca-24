import { model, Schema } from 'mongoose';


const DepthSchema = new Schema(
  {
    marketId: {
      type: String,
      required: true,
    },
    side: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

DepthSchema.index({ marketId: 1, price: 1 }, { unique: true });

export const Depth = model('Depth', DepthSchema);
