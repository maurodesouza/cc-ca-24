import axios from "axios";

axios.defaults.validateStatus = () => true;

export interface AccountGateway {
  signup(account: any): Promise<any>;
  getById(accountId: string): Promise<any>;
}

const ACCOUNT_SERVICE_PORT = 4156

export class AccountGatewayHTTP implements AccountGateway {
  async signup(account: any): Promise<any> {
    const response = await axios.post(`http://localhost:${ACCOUNT_SERVICE_PORT}/signup`, account);
    if (response.status > 299) throw new Error(response.data.message || "internal server error")
    return response.data
  }

  async getById(accountId: string): Promise<any> {
    const response = await axios.get(`http://localhost:${ACCOUNT_SERVICE_PORT}/accounts/${accountId}`);
    if (response.status > 299) throw new Error(response.data.message || "internal server error")
    return response.data
  }
}
