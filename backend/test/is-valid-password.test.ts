import { isValidPassword } from "../src/is-valid-password";

test.each([
    "Abc12345",
    "Password123",
    "MySecret99"
])("Deve validar uma senha: %s", (password: string) => {
    const isValid = isValidPassword(password);
    expect(isValid).toBe(true);
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
    const isValid = isValidPassword(password);
    expect(isValid).toBe(false);
});
