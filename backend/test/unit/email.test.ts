import { Email } from "../../src/domain/email";

test.each([
    "mauro@example.com",
    "test.email@domain.com",
    "user123@sub.domain.org"
])("Deve validar um email: %s", (email: string) => {
    const emailVo = new Email(email);
    expect(emailVo.value).toBe(email);
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
    expect(() => new Email(email)).toThrow("Invalid email");
});
