import axios from "axios";

axios.defaults.validateStatus = () => true;

type InputUpdateOrder = {
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
}

export interface OrderGateway {
  update(order: InputUpdateOrder): Promise<void>;
}

const ORDER_SERVICE_PORT = 4157

export class OrderGatewayHTTP implements OrderGateway {
  async update(order: InputUpdateOrder): Promise<void> {
    const response = await axios.put(`http://localhost:${ORDER_SERVICE_PORT}/orders/${order.orderId}`, order);
    if (response.status > 299) throw new Error(response.data.message || "internal server error")
  }
}
