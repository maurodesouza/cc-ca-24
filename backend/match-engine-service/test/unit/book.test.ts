import { Book } from "../../src/domain/book";
import { Order } from "../../src/domain/order";
import { UUID } from "../../src/domain/uuid";

describe("Book", () => {
  let book: Book;
  let accountId: string;

  beforeEach(() => {
    book = new Book("BTC-USD");
    accountId = UUID.create().value;
  });

  describe("Insert", () => {
    test("Deve inserir ordem de compra em buys", () => {
      const order = Order.create(accountId, "BTC-USD", "buy", 1, 50000);
      book.insert(order);

      expect(book.buys).toHaveLength(1);
      expect(book.buys[0]).toBe(order);
      expect(book.sells).toHaveLength(0);
    });

    test("Deve inserir ordem de venda em sells", () => {
      const order = Order.create(accountId, "BTC-USD", "sell", 1, 50000);
      book.insert(order);

      expect(book.sells).toHaveLength(1);
      expect(book.sells[0]).toBe(order);
      expect(book.buys).toHaveLength(0);
    });

    test("Deve ordenar buys em ordem decrescente de preço", () => {
      const order1 = Order.create(accountId, "BTC-USD", "buy", 1, 40000);
      const order2 = Order.create(accountId, "BTC-USD", "buy", 1, 60000);
      const order3 = Order.create(accountId, "BTC-USD", "buy", 1, 50000);

      book.insert(order1);
      book.insert(order2);
      book.insert(order3);

      expect(book.buys).toHaveLength(3);
      expect(book.buys[0].getPrice()).toBe(60000);
      expect(book.buys[1].getPrice()).toBe(50000);
      expect(book.buys[2].getPrice()).toBe(40000);
    });

    test("Deve ordenar sells em ordem crescente de preço", () => {
      const order1 = Order.create(accountId, "BTC-USD", "sell", 1, 60000);
      const order2 = Order.create(accountId, "BTC-USD", "sell", 1, 40000);
      const order3 = Order.create(accountId, "BTC-USD", "sell", 1, 50000);

      book.insert(order1);
      book.insert(order2);
      book.insert(order3);

      expect(book.sells).toHaveLength(3);
      expect(book.sells[0].getPrice()).toBe(40000);
      expect(book.sells[1].getPrice()).toBe(50000);
      expect(book.sells[2].getPrice()).toBe(60000);
    });
  });

  describe("Execute", () => {
    test("Não deve fazer match quando não há ordens", async () => {
      await book.execute();

      expect(book.buys).toHaveLength(0);
      expect(book.sells).toHaveLength(0);
    });

    test("Não deve fazer match quando só há buys", async () => {
      const order = Order.create(accountId, "BTC-USD", "buy", 1, 50000);
      book.insert(order);

      expect(book.buys).toHaveLength(1);
      expect(book.sells).toHaveLength(0);
    });

    test("Não deve fazer match quando só há sells", async () => {
      const order = Order.create(accountId, "BTC-USD", "sell", 1, 50000);
      book.insert(order);

      expect(book.buys).toHaveLength(0);
      expect(book.sells).toHaveLength(1);
    });

    test("Não deve fazer match quando preço bid menor que ask", async () => {
      const buyOrder = Order.create(accountId, "BTC-USD", "buy", 1, 40000);
      const sellOrder = Order.create(accountId, "BTC-USD", "sell", 1, 50000);

      book.insert(buyOrder);
      book.insert(sellOrder);

      expect(book.buys).toHaveLength(1);
      expect(book.sells).toHaveLength(1);
      expect(buyOrder.getFillQuantity()).toBe(0);
      expect(sellOrder.getFillQuantity()).toBe(0);
    });

    test("Deve fazer match quando preço bid maior que ask", async () => {
      const buyOrder = Order.create(accountId, "BTC-USD", "buy", 1, 60000);
      const sellOrder = Order.create(accountId, "BTC-USD", "sell", 1, 50000);

      book.insert(buyOrder);
      book.insert(sellOrder);

      expect(buyOrder.getFillQuantity()).toBe(1);
      expect(sellOrder.getFillQuantity()).toBe(1);
    });

    test("Deve preencher com preço do ask quando ask mais antigo", async () => {
      const timestamp = new Date("2024-01-01T00:00:00");
      const buyOrder = Order.create(accountId, "BTC-USD", "buy", 1, 60000);
      const sellOrder = Order.create(accountId, "BTC-USD", "sell", 1, 50000, 0, 0, "open", timestamp);

      book.insert(buyOrder);
      book.insert(sellOrder);

      expect(buyOrder.getFillPrice()).toBe(50000);
      expect(sellOrder.getFillPrice()).toBe(50000);
    });

    test("Deve preencher com preço do bid quando bid mais antigo", async () => {
      const timestamp = new Date("2024-01-01T00:00:00");
      const buyOrder = Order.create(accountId, "BTC-USD", "buy", 1, 60000, 0, 0, "open", timestamp);
      const sellOrder = Order.create(accountId, "BTC-USD", "sell", 1, 50000);

      book.insert(buyOrder);
      book.insert(sellOrder);

      expect(buyOrder.getFillPrice()).toBe(60000);
      expect(sellOrder.getFillPrice()).toBe(60000);
    });

    test("Deve remover ordem fechada de buys", async () => {
      const buyOrder = Order.create(accountId, "BTC-USD", "buy", 1, 60000);
      const sellOrder = Order.create(accountId, "BTC-USD", "sell", 1, 50000);

      book.insert(buyOrder);
      book.insert(sellOrder);

      expect(book.buys).toHaveLength(0);
      expect(buyOrder.getStatus()).toBe("closed");
    });

    test("Deve remover ordem fechada de sells", async () => {
      const buyOrder = Order.create(accountId, "BTC-USD", "buy", 1, 60000);
      const sellOrder = Order.create(accountId, "BTC-USD", "sell", 1, 50000);

      book.insert(buyOrder);
      book.insert(sellOrder);

      expect(book.sells).toHaveLength(0);
      expect(sellOrder.getStatus()).toBe("closed");
    });

    test("Deve fazer match parcial quando quantidades diferentes", async () => {
      const buyOrder = Order.create(accountId, "BTC-USD", "buy", 2, 60000);
      const sellOrder = Order.create(accountId, "BTC-USD", "sell", 1, 50000);

      book.insert(buyOrder);
      book.insert(sellOrder);

      expect(buyOrder.getFillQuantity()).toBe(1);
      expect(sellOrder.getFillQuantity()).toBe(1);
      expect(sellOrder.getStatus()).toBe("closed");
      expect(buyOrder.getStatus()).toBe("open");
      expect(book.sells).toHaveLength(0);
      expect(book.buys).toHaveLength(1);
    });

    test("Deve continuar fazendo match em loop", async () => {
      const buyOrder1 = Order.create(accountId, "BTC-USD", "buy", 1, 60000);
      const sellOrder1 = Order.create(accountId, "BTC-USD", "sell", 1, 50000);
      const buyOrder2 = Order.create(accountId, "BTC-USD", "buy", 1, 55000);
      const sellOrder2 = Order.create(accountId, "BTC-USD", "sell", 1, 52000);

      book.insert(buyOrder1);
      book.insert(buyOrder2);
      book.insert(sellOrder1);
      book.insert(sellOrder2);

      expect(buyOrder1.getStatus()).toBe("closed");
      expect(sellOrder1.getStatus()).toBe("closed");
      expect(buyOrder2.getStatus()).toBe("closed");
      expect(sellOrder2.getStatus()).toBe("closed");
      expect(book.buys).toHaveLength(0);
      expect(book.sells).toHaveLength(0);
    });

    test("Deve chamar notifyAll quando faz match de ordens", async () => {
      const notifiedOrders: Order[] = [];
      const notifyAllSpy = jest.spyOn(book, "notifyAll").mockImplementation(async (event) => {
        notifiedOrders.push(event.getPayload());
      });

      const buyOrder = Order.create(accountId, "BTC-USD", "buy", 1, 60000);
      const sellOrder = Order.create(accountId, "BTC-USD", "sell", 1, 50000);

      await book.insert(buyOrder);
      await book.insert(sellOrder);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(notifiedOrders.length).toBe(2);
      expect(notifiedOrders.map(o => o.getOrderId())).toContain(buyOrder.getOrderId());
      expect(notifiedOrders.map(o => o.getOrderId())).toContain(sellOrder.getOrderId());

      notifyAllSpy.mockRestore();
    });

    test("Não deve chamar notifyAll quando não há match", async () => {
      const notifyAllSpy = jest.spyOn(book, "notifyAll");

      const buyOrder = Order.create(accountId, "BTC-USD", "buy", 1, 40000);
      const sellOrder = Order.create(accountId, "BTC-USD", "sell", 1, 50000);

      book.insert(buyOrder);
      book.insert(sellOrder);

      expect(notifyAllSpy).not.toHaveBeenCalled();

      notifyAllSpy.mockRestore();
    });

    test("Deve chamar notifyAll para ordens que deram match com múltiplas ordens", async () => {
      const notifiedOrders: Order[] = [];
      const notifyAllSpy = jest.spyOn(book, "notifyAll").mockImplementation(async (event) => {
        notifiedOrders.push(event.getPayload());
      });

      const buyOrder1 = Order.create(accountId, "BTC-USD", "buy", 1, 60000);
      const buyOrder2 = Order.create(accountId, "BTC-USD", "buy", 1, 48000);
      const sellOrder1 = Order.create(accountId, "BTC-USD", "sell", 1, 50000);
      const sellOrder2 = Order.create(accountId, "BTC-USD", "sell", 1, 52000);

      await book.insert(buyOrder1);
      await book.insert(buyOrder2);
      await book.insert(sellOrder1);
      await book.insert(sellOrder2);

      await new Promise(resolve => setTimeout(resolve, 10));

      const notifiedOrderIds = notifiedOrders.map(o => o.getOrderId());

      expect(notifiedOrderIds.length).toBe(2);
      expect(notifiedOrderIds).toContain(buyOrder1.getOrderId());
      expect(notifiedOrderIds).toContain(sellOrder1.getOrderId());

      expect(notifiedOrderIds).not.toContain(buyOrder2.getOrderId());
      expect(notifiedOrderIds).not.toContain(sellOrder2.getOrderId());

      notifyAllSpy.mockRestore();
    });
  });
});
