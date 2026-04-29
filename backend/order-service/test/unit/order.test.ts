import { Order } from "../../src/domain/order";
import { UUID } from "../../src/domain/uuid";

describe("Order", () => {
  test("Deve criar uma ordem", () => {
    const accountId = UUID.create().value;
    const timestamp = new Date();
    const order1 = Order.create(accountId, "BTC-USD", "sell", 2, 60000, 1, 58000, "partial", timestamp);

    const { mainAsset, paymentAsset } = order1.getMainAndPaymentAssets();

    expect(order1.getOrderId()).toBeDefined();
    expect(order1.getAccountId()).toBe(accountId);
    expect(order1.getMarketId()).toBe("BTC-USD");
    expect(order1.getSide()).toBe("sell");
    expect(order1.getQuantity()).toBe(2);
    expect(order1.getPrice()).toBe(60000);
    expect(order1.getFillQuantity()).toBe(1);
    expect(order1.getFillPrice()).toBe(58000);
    expect(order1.getStatus()).toBe("partial");
    expect(order1.getTimestamp()).toBe(timestamp);

    expect(mainAsset).toBe("BTC");
    expect(paymentAsset).toBe("USD");

    const order2 = Order.create(accountId, "BTC-USD", "buy", 2, 60000, 1, 58000, "partial", timestamp);

    expect(order1.isBuy()).toBe(false);
    expect(order2.isBuy()).toBe(true);
  });

  describe("Fill", () => {
    test("Deve calcular quantidade disponível sem preenchimentos", () => {
      const accountId = UUID.create().value;
      const order = Order.create(accountId, "BTC-USD", "buy", 10, 50000);

      expect(order.getAvailableQuantity()).toBe(10);
    });

    test("Deve calcular quantidade disponível com preenchimentos parciais", () => {
      const accountId = UUID.create().value;
      const order = Order.create(accountId, "BTC-USD", "buy", 10, 50000, 3, 48000);

      expect(order.getAvailableQuantity()).toBe(7);
    });

    test("Deve preencher ordem parcialmente", () => {
      const accountId = UUID.create().value;
      const order = Order.create(accountId, "BTC-USD", "buy", 10, 50000);

      order.fill(3, 48000);
      expect(order.getStatus()).toBe("open");

      expect(order.getFillPrice()).toBe(48000);
      expect(order.getFillQuantity()).toBe(3);
      expect(order.getAvailableQuantity()).toBe(7);
    });

    test("Deve preencher ordem completamente e fechar", () => {
      const accountId = UUID.create().value;
      const order = Order.create(accountId, "BTC-USD", "buy", 10, 50000);

      order.fill(10, 50000);
      expect(order.getStatus()).toBe("closed");

      expect(order.getFillPrice()).toBe(50000);
      expect(order.getFillQuantity()).toBe(10);
      expect(order.getAvailableQuantity()).toBe(0);
    });

    test("Deve preencher ordem completamente com múltiplos fills", () => {
      const accountId = UUID.create().value;
      const order = Order.create(accountId, "BTC-USD", "buy", 10, 50000);

      order.fill(5, 49000);
      expect(order.getStatus()).toBe("open");

      order.fill(5, 51000);
      expect(order.getStatus()).toBe("closed");

      expect(order.getFillPrice()).toBe(50000);
      expect(order.getFillQuantity()).toBe(10);
      expect(order.getAvailableQuantity()).toBe(0);
    });
  })
});
