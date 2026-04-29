import axios from "axios";

axios.defaults.validateStatus = () => true;

type InputInsertOrder = {
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

export interface MatchEngineGateway {
  insert(order: InputInsertOrder): Promise<void>;
}

const MATCH_ENGINE_SERVICE_PORT = 4158

export class MatchEngineGatewayHTTP implements MatchEngineGateway {
  async insert(order: InputInsertOrder): Promise<void> {
    const response = await axios.post(`http://localhost:${MATCH_ENGINE_SERVICE_PORT}/markets/${order.marketId}/orders`, order);
    if (response.status > 299) throw new Error(response.data.message || "internal server error")
  }
}
