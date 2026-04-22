import { isValidEmail } from "../src/is-valid-email";

test.each([
    "mauro@example.com",
    "test.email@domain.com",
    "user123@sub.domain.org"
])("Deve validar um email: %s", (email: string) => {
    const isValid = isValidEmail(email);
    expect(isValid).toBe(true);
});

test.each([
    "invalid-email",
    null,
    undefined,
    "",
    "@example.com",
    "user@",
    "user@domain",
    "user domain.com"
])("Não deve validar um email: %s", (email: any) => {
    const isValid = isValidEmail(email);
    expect(isValid).toBe(false);
});
