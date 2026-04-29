import { UUID } from "../../src/domain/uuid";

test("Deve criar um UUID com factory pattern", () => {
    const uuid = UUID.create();
    expect(uuid.value).toBeDefined();
    expect(uuid.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
});

test("Deve validar um UUID existente", () => {
    const validUuid = "550e8400-e29b-41d4-a716-446655440000";
    const uuid = new UUID(validUuid);
    expect(uuid.value).toBe(validUuid);
});

test.each([
    "invalid-uuid",
    "12345",
    null,
    undefined,
    "",
    "550e8400-e29b-41d4-a716"
])("Não deve validar um UUID inválido: %s", (uuid: any) => {
    expect(() => new UUID(uuid)).toThrow("Invalid UUID");
});
