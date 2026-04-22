import axios from "axios";
import { AccountDAODatabase } from "../src/account-DAO";

axios.defaults.validateStatus = () => true;

const validInput = {
  accountId: crypto.randomUUID(),
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

test("Deve persistir uma conta no banco de dados", async () => {
  const input = { ...validInput }

  const accountDAO = new AccountDAODatabase();
  await accountDAO.save(input);

  const getAccountOutput = await accountDAO.getById(input.accountId);

  expect(getAccountOutput.account_id).toBe(input.accountId);
  expect(getAccountOutput.name).toBe(input.name);
  expect(getAccountOutput.email).toBe(input.email);
  expect(getAccountOutput.document).toBe(input.document);
});
