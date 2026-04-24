import { Password } from "../src/domain/password";

test.each([
    "Abc12345",
    "Password123",
    "MySecret99"
])("Deve validar uma senha: %s", (password: string) => {
    const passwordVo = new Password(password);
    expect(passwordVo.value).toBe(password);
});

test.each([
    "short",
    "alllowercase123",
    "ALLUPPERCASE123",
    "NoNumbersHere",
    null,
    undefined,
    ""
])("Não deve validar uma senha: %s", (password: any) => {
    expect(() => new Password(password)).toThrow("Invalid password");
});
