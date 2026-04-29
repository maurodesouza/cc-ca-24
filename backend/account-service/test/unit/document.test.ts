import { Document } from "../../src/domain/document";

test.each([
    "97456321558",
    "87748248800"
])("Deve validar um documento: %s", (cpf: string) => {
    const document = new Document(cpf);
    expect(document.value).toBe(cpf);
});

test.each([
    "974563215",
    null,
    undefined,
    "11111111111",
    "11111111abc"
])("Não deve validar um documento: %s", (cpf: any) => {
    expect(() => new Document(cpf)).toThrow("Invalid document");
});
