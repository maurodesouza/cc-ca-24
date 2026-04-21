import { validateCpf } from "../src/validate-cpf";

test.each([
    "97456321558",
    "87748248800"
])("Deve validar um cpf: %s", (cpf: string) => {
    const isValid = validateCpf(cpf);
    expect(isValid).toBe(true);
});

test.each([
    "974563215",
    null,
    undefined,
    "11111111111",
    "11111111abc"
])("Não deve validar um cpf: %s", (cpf: any) => {
    const isValid = validateCpf(cpf);
    expect(isValid).toBe(false);
});
