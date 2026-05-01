import { CircuitBreaker } from "../../src/infra/utils/circuit-breaker";

describe("CircuitBreaker", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("Deve criar um circuit breaker com as configurações corretas", async () => {
    const message = "success";

    const fn = jest.fn().mockResolvedValue(message);

    {
      const breaker = new CircuitBreaker(fn);

      expect(breaker["options"].threshold).toBe(5);
      expect(breaker["options"].timeout).toBe(5000);
      expect(breaker["options"].resetTimeout).toBe(30000);
    }

    {
      const breaker = new CircuitBreaker(fn, { threshold: 1, timeout: 1, resetTimeout: 1 });

      expect(breaker["options"].threshold).toBe(1);
      expect(breaker["options"].timeout).toBe(1);
      expect(breaker["options"].resetTimeout).toBe(1);
    }

    {
      const breaker = new CircuitBreaker(fn, { threshold: 1, timeout: 1 });

      expect(breaker["options"].threshold).toBe(1);
      expect(breaker["options"].timeout).toBe(1);
      expect(breaker["options"].resetTimeout).toBe(30000);
    }
  });

  test("Deve transicionar para OPEN depois de atingir o threshold de falhas", async () => {
    const error = new Error("fail");

    const fn = jest.fn().mockRejectedValue(error);

    {
      const breaker = new CircuitBreaker(fn, { threshold: 2 });

      await expect(breaker.execute()).rejects.toThrow(error);
      expect(breaker["state"]).toBe("CLOSED");
      await expect(breaker.execute()).rejects.toThrow(error);

      expect(breaker["state"]).toBe("OPEN");
      expect(breaker["failureCount"]).toBe(2);
    }

    {
      const breaker = new CircuitBreaker(fn, { threshold: 5 });

      await expect(breaker.execute()).rejects.toThrow(error);
      await expect(breaker.execute()).rejects.toThrow(error);
      await expect(breaker.execute()).rejects.toThrow(error);
      await expect(breaker.execute()).rejects.toThrow(error);
      expect(breaker["state"]).toBe("CLOSED");
      await expect(breaker.execute()).rejects.toThrow(error);

      expect(breaker["state"]).toBe("OPEN");
      expect(breaker["failureCount"]).toBe(5);
    }
  });

  test("Deve jogar erro ao tentar executar com o circuit breaker no estado OPEN", async () => {
    const error = new Error("fail");

    const fn = jest.fn().mockRejectedValue(error);

    {
      const breaker = new CircuitBreaker(fn, { threshold: 2 });

      await expect(breaker.execute()).rejects.toThrow(error);
      expect(breaker["state"]).toBe("CLOSED");
      await expect(breaker.execute()).rejects.toThrow(error);
      expect(breaker["state"]).toBe("OPEN");

      await expect(breaker.execute()).rejects.toThrow("[circuit-breaker]: is OPEN");
      expect(breaker["failureCount"]).toBe(2);
      await expect(breaker.execute()).rejects.toThrow("[circuit-breaker]: is OPEN");
      expect(breaker["failureCount"]).toBe(2);
    }
  });

  test("Deve permitir executar 1 vez depois de atingir o timeout", async () => {
    const error = new Error("fail");
    const message = "success";

    {
      let resolve!: (value: unknown) => void;
      const pendingPromise = new Promise((r) => (resolve = r));

      const fn = jest.fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockImplementation(() => pendingPromise);

      const breaker = new CircuitBreaker(fn, { threshold: 2, resetTimeout: 1000 });

      await expect(breaker.execute()).rejects.toThrow(error);
      expect(breaker["state"]).toBe("CLOSED");

      await expect(breaker.execute()).rejects.toThrow(error);
      expect(breaker["state"]).toBe("OPEN");

      await jest.advanceTimersByTimeAsync(1500);

      const promise = breaker.execute();

      await expect(
        breaker.execute()
      ).rejects.toThrow("[circuit-breaker]: HALF_OPEN execution already in progress");

      resolve(message);
      await promise;

      expect(breaker["state"]).toBe("CLOSED");
      expect(breaker["failureCount"]).toBe(0);
    }
  });

  test("Deve retornar para CLOSED após sucesso no HALF_OPEN", async () => {
    const error = new Error("fail");
    const message = "success";

    const fn = jest.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue(message);

    {
      const breaker = new CircuitBreaker(fn, { threshold: 2, resetTimeout: 1000 });

      await expect(breaker.execute()).rejects.toThrow(error);
      expect(breaker["state"]).toBe("CLOSED");
      await expect(breaker.execute()).rejects.toThrow(error);
      expect(breaker["state"]).toBe("OPEN");

      await jest.advanceTimersByTimeAsync(1500);

      const result = await breaker.execute();
      expect(result).toBe(message);
      expect(breaker["state"]).toBe("CLOSED");
      expect(breaker["failureCount"]).toBe(0);
    }
  });

  test("Deve retornar para OPEN após falha no HALF_OPEN", async () => {
    const error = new Error("fail");
    const fn = jest.fn().mockRejectedValue(error)

    {
      const breaker = new CircuitBreaker(fn, { threshold: 2, resetTimeout: 1000 });

      await expect(breaker.execute()).rejects.toThrow(error);
      expect(breaker["state"]).toBe("CLOSED");
      await expect(breaker.execute()).rejects.toThrow(error);
      expect(breaker["state"]).toBe("OPEN");

      await jest.advanceTimersByTimeAsync(1500);

      await expect(breaker.execute()).rejects.toThrow(error);

      expect(breaker["state"]).toBe("OPEN");
      expect(breaker["failureCount"]).toBe(2);
      expect(breaker["halfOpenExecutions"]).toBe(0);
    }
  });

  test("Deve jogar erro de timeout", async () => {
    const message = "success";

    const pendingPromise = new Promise((resolve) => setTimeout(() => resolve(message), 2000));

    const fn = jest.fn().mockImplementation(() => pendingPromise);

    {
      const breaker = new CircuitBreaker(fn, { timeout: 1000 });

      const promise = breaker.execute();
      const assertion = expect(promise).rejects.toThrow("[circuit-breaker]: timeout");

      await jest.advanceTimersByTimeAsync(1000);
      await assertion;


      expect(breaker["state"]).toBe("CLOSED");
      expect(breaker["failureCount"]).toBe(1);
    }
  });
});
