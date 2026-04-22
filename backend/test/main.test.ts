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
    expect(getAccountResponse.data.account_id).toBe(signupResponse.data.accountId);
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

  test("Não deve criar conta com email invalido", async () => {
    const input = {
      ...validInput,
      email: "john.doe"
    }

    const response = await axios.post("http://localhost:4156/signup", input)

    expect(response.status).toBe(400);
    expect(response.data.message).toBe("Invalid email");
  })

  test("Não deve criar conta com senha invalida", async () => {
    const input = {
      ...validInput,
      password: "1234567"
    }

    const response = await axios.post("http://localhost:4156/signup", input)

    expect(response.status).toBe(400);
    expect(response.data.message).toBe("Invalid password");
  })

  test("Não deve criar conta com documento invalido", async () => {
    const input = {
      ...validInput,
      document: "11111"
    }

    const response = await axios.post("http://localhost:4156/signup", input)

    expect(response.status).toBe(400);
    expect(response.data.message).toBe("Invalid document");
  })

  test("Deve retornar 400 ao não encontar uma conta", async () => {

    const response = await axios.get(`http://localhost:4156/accounts/${crypto.randomUUID()}`)

    expect(response.status).toBe(400);
    expect(response.data.message).toBe("Account not found");
  })
});
