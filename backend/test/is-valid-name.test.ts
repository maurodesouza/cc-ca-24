import { isValidName } from "../src/domain/is-valid-name";

test.each([
    "Mauro de Souza",
    "Antonio Carlos",
    "Eloy Casagrande"
])("Deve validar um nome: %s", (name: string) => {
    const isValid = isValidName(name);
    expect(isValid).toBe(true);
});

test.each([
    "John",
    null,
    undefined,
    "",
    "   "
])("Não deve validar um nome: %s", (name: any) => {
    const isValid = isValidName(name);
    expect(isValid).toBe(false);
});
