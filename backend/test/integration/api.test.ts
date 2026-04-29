import axios from "axios";

axios.defaults.validateStatus = () => true;

const validInput = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

describe("Account", () => {
  test("Deve criar uma conta", async () => {
    const input = { ...validInput }

    const signupResponse = await axios.post("http://localhost:4156/signup", input);
    expect(signupResponse.status).toBe(201);
    expect(signupResponse.data.accountId).toBeDefined();

    const getAccountResponse = await axios.get(`http://localhost:4156/accounts/${signupResponse.data.accountId}`);

    expect(getAccountResponse.status).toBe(200);
    expect(getAccountResponse.data.accountId).toBe(signupResponse.data.accountId);
    expect(getAccountResponse.data.name).toBe(input.name);
    expect(getAccountResponse.data.email).toBe(input.email);
    expect(getAccountResponse.data.document).toBe(input.document);
  });

  test("Não deve criar conta com nome invalido", async () => {
    const input = {
      ...validInput,
      name: "John",
    }

    const response = await axios.post("http://localhost:4156/signup", input)


    expect(response.status).toBe(400);
    expect(response.data.message).toBe("Invalid name");
  })

  test("Deve criar uma ordem de compra e uma ordem de venda em uma conta", async () => {
    const marketId = "BTC-USD";
    const input = { ...validInput }

    const responseSignup = await axios.post("http://localhost:4156/signup", input);
    const outputSignup = responseSignup.data;

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

    await axios.post("http://localhost:4156/deposit", BTCdeposit);
    await axios.post("http://localhost:4156/deposit", USDdeposit);

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


    const outputPlaceOrder1 = (await axios.post("http://localhost:4156/place-order", order1)).data;
    const outputPlaceOrder2 = (await axios.post("http://localhost:4156/place-order", order2)).data;
    const outputPlaceOrder3 = (await axios.post("http://localhost:4156/place-order", order3)).data;

    const outputGetOrder1 = (await axios.get(`http://localhost:4156/orders/${outputPlaceOrder1.orderId}`)).data;
    const outputGetOrder2 = (await axios.get(`http://localhost:4156/orders/${outputPlaceOrder2.orderId}`)).data;
    const outputGetOrder3 = (await axios.get(`http://localhost:4156/orders/${outputPlaceOrder3.orderId}`)).data;

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
