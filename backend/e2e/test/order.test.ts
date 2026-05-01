import axios from "axios";
import { sleep } from "../utils/sleep";

axios.defaults.validateStatus = () => true;

const validInput = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

describe("Order", () => {
  test("Deve criar uma ordem de compra e uma ordem de venda em uma conta", async () => {
    const marketId = "BTC-USD";
    const input = { ...validInput }

    const responseSignup = await axios.post("http://localhost:4156/signup", input);
    const outputSignup = responseSignup.data;

    await sleep(1000);

    const BTCdeposit = {
        accountId: outputSignup.accountId,
        assetId: "BTC",
        quantity: 2
    }

    const USDdeposit = {
        accountId: outputSignup.accountId,
        assetId: "USD",
        quantity: 200000
    }

    await axios.post("http://localhost:4157/deposit", BTCdeposit);
    await axios.post("http://localhost:4157/deposit", USDdeposit);

    const order1 = {
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 78000
    }

    const order2 = {
        accountId: outputSignup.accountId,
        marketId,
        side: "sell",
        quantity: 1,
        price: 79000
    }

    const order3 = {
        accountId: outputSignup.accountId,
        marketId,
        side: "buy",
        quantity: 2,
        price: 80000
    }

    const outputPlaceOrder1 = (await axios.post("http://localhost:4157/place-order", order1)).data;
    const outputPlaceOrder2 = (await axios.post("http://localhost:4157/place-order", order2)).data;
    const outputPlaceOrder3 = (await axios.post("http://localhost:4157/place-order", order3)).data;


    console.log("outputPlaceOrder1", outputPlaceOrder1)
    console.log("outputPlaceOrder2", outputPlaceOrder2)
    console.log("outputPlaceOrder3", outputPlaceOrder3)

    await sleep(1000);

    const outputGetOrder1 = (await axios.get(`http://localhost:4157/orders/${outputPlaceOrder1.orderId}`)).data;
    const outputGetOrder2 = (await axios.get(`http://localhost:4157/orders/${outputPlaceOrder2.orderId}`)).data;
    const outputGetOrder3 = (await axios.get(`http://localhost:4157/orders/${outputPlaceOrder3.orderId}`)).data;

    console.log("outputGetOrder1", outputGetOrder1)
    console.log("outputGetOrder2", outputGetOrder2)
    console.log("outputGetOrder3", outputGetOrder3)

    expect(outputGetOrder1.fillQuantity).toBe(1);
    expect(outputGetOrder1.fillPrice).toBe(78000);
    expect(outputGetOrder1.status).toBe("closed");

    expect(outputGetOrder2.fillQuantity).toBe(1);
    expect(outputGetOrder2.fillPrice).toBe(79000);
    expect(outputGetOrder2.status).toBe("closed");

    expect(outputGetOrder3.fillQuantity).toBe(2);
    expect(outputGetOrder3.fillPrice).toBe(78500);
    expect(outputGetOrder3.status).toBe("closed");
});
});
