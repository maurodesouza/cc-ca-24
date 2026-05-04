import { model, Schema } from 'mongoose';


const Balance = new Schema({
  asset_id: {
    type: Number,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  blocked_quantity: {
    type: String,
    required: true,
  },
})

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

const AccountWithBalance = model('AccountWithBalance', AccountWithBalanceSchema);

export default AccountWithBalance;
