import axios from "axios";

const validInput = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

describe("Account", () => {
  test("Deve criar uma conta", async () => {
    const input = { ...validInput }

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

  test("Não deve criar conta com nome invalido", async () => {
    const input = {
      ...validInput,
      name: "John",
    }

    await expect(
      axios.post("http://localhost:3000/signup", input)
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          message: "Invalid name"
        }
      }
    });
  })

  test("Não deve criar conta com email invalido", async () => {
    const input = {
      ...validInput,
      email: "john.doe"
    }

    await expect(
      axios.post("http://localhost:3000/signup", input)
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          message: "Invalid email"
        }
      }
    });
  })

  test("Não deve criar conta com senha invalida", async () => {
    const input = {
      ...validInput,
      password: "1234567"
    }

    await expect(
      axios.post("http://localhost:3000/signup", input)
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          message: "Invalid password"
        }
      }
    });
  })

  test("Não deve criar conta com documento invalido", async () => {
    const input = {
      ...validInput,
      document: "11111"
    }

    await expect(
      axios.post("http://localhost:3000/signup", input)
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          message: "Invalid document"
        }
      }
    });
  })

  test("Deve retornar 400 ao não encontar uma conta", async () => {
    await expect(
      axios.get(`http://localhost:3000/accounts/${crypto.randomUUID()}`)
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          message: "Account not found"
        }
      }
    });
  })
});
