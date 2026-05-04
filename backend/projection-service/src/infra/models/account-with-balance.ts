import { model, Schema } from 'mongoose';


const Balance = new Schema({
  assetId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  blockedQuantity: {
    type: Number,
    required: true,
  },
}, { _id: false })

const AccountWithBalanceSchema = new Schema(
  {
    accountId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    balance: [Balance],
  },
  {
    timestamps: true,
  }
);

export const AccountWithBalance = model('AccountWithBalance', AccountWithBalanceSchema);
