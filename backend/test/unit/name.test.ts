import { Name } from "../../src/domain/name";

test.each([
    "Mauro de Souza",
    "Antonio Carlos",
    "Eloy Casagrande"
])("Deve validar um nome: %s", (name: string) => {
    const nameVo = new Name(name);
    expect(nameVo.value).toBe(name);
});

test.each([
    "John",
    null,
    undefined,
    "",
    "   "
])("Não deve validar um nome: %s", (name: any) => {
    expect(() => new Name(name)).toThrow("Invalid name");
});
