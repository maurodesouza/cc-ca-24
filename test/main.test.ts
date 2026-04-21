import { sum } from "../src/main";

test("Deve somar dois numeros", () => {
  const result = sum(1, 2);

  expect(result).toBe(3);
});