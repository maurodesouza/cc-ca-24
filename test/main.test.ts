import axios from "axios";

test("Deve criar uma conta", async () => {
  const input = {
    name: "John Doe",
    email: "john.doe@example.com",
    document: "12345678900",
    password: "12345678"
  }

  const signupResponse = await axios.post("http://localhost:3000/signup", input);
  expect(signupResponse.status).toBe(201);
  expect(signupResponse.data.accountId).toBeDefined();

  const getAccountResponse = await axios.get(`http://localhost:3000/accounts/${signupResponse.data.accountId}`);

  expect(getAccountResponse.status).toBe(200);
  expect(getAccountResponse.data.account_id).toBe(signupResponse.data.accountId);
  expect(getAccountResponse.data.name).toBe(input.name);
  expect(getAccountResponse.data.email).toBe(input.email);
  expect(getAccountResponse.data.document).toBe(input.document);
});
