import { Order } from "../../../domain/order";
import { column, model, Model } from "../orm";

@model("ccca", "order")
export class OrderModel extends Model {
  @column("order_id", true)
  orderId!: string
  @column("account_id")
  accountId!: string
  @column("market_id")
  marketId!: string
  @column("side")
  side!: string
  @column("quantity")
  quantity!: number
  @column("price")
  price!: number
  @column("fill_quantity")
  fillQuantity!: number
  @column("fill_price")
  fillPrice!: number
  @column("status")
  status!: string
  @column("timestamp")
  timestamp!: Date

  constructor(
    orderId: string,
    accountId: string,
    marketId: string,
    side: string,
    quantity: number,
    price: number,
    fillQuantity: number,
    fillPrice: number,
    status: string,
    timestamp: Date,
  ) {
    super()
    this.orderId = orderId
    this.accountId = accountId
    this.marketId = marketId
    this.side = side
    this.quantity = quantity
    this.price = price
    this.fillQuantity = fillQuantity
    this.fillPrice = fillPrice
    this.status = status
    this.timestamp = timestamp
  }

  static fromEntity(order: Order) {
    return new OrderModel(
      order.getOrderId(),
      order.getAccountId(),
      order.getMarketId(),
      order.getSide(),
      order.getQuantity(),
      order.getPrice(),
      order.getFillQuantity(),
      order.getFillPrice(),
      order.getStatus(),
      order.getTimestamp()
    )
  }

  toEntity() {
    return new Order(
      this.orderId,
      this.accountId,
      this.marketId,
      this.side,
      parseFloat(String(this.quantity)),
      parseFloat(String(this.price)),
      parseFloat(String(this.fillQuantity)),
      parseFloat(String(this.fillPrice)),
      this.status,
      this.timestamp,
    )
  }
}
