import { Retry } from "../../src/infra/utils/retry";
import * as sleepModule from "../../src/infra/utils/sleep";

describe("Retry", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("Deve realizar o retry quando houver falha e atingir o limite de retries", async () => {
    const message = "success";
    const error = new Error("fail");

    {
      const fn = jest.fn().mockResolvedValue(message);
      const result = await Retry.execute(fn);

      expect(result).toBe(message);
      expect(fn).toHaveBeenCalledTimes(1);
    }

    {
      const fn = jest.fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(message);

      const promise = Retry.execute(fn, 3, 100);

      await jest.advanceTimersByTimeAsync(300);

      const result = await promise;

      expect(result).toBe(message);
      expect(fn).toHaveBeenCalledTimes(4);
    }
  });

  test("Deve jogar erro quando atingir o limite de retries", async () => {
    const error = new Error("fail");

    {
      const fn = jest.fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)

      const promise = Retry.execute(fn, 2, 100);
      const assertion = expect(promise).rejects.toThrow("max retries exceeded");

      await jest.advanceTimersByTimeAsync(200);
      await assertion;

      expect(fn).toHaveBeenCalledTimes(3);
    }
  });

  test("Deve aplicar o delay exponencialmente", async () => {
    const error = new Error("fail");

    {
      const fn = jest.fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue("ok");

      const sleepSpy = jest
        .spyOn(sleepModule, "sleep")
        .mockResolvedValue(undefined);

      const result = await Retry.execute(fn, 4, 100, 2);

      expect(result).toBe("ok");

      expect(sleepSpy).toHaveBeenNthCalledWith(1, 100);
      expect(sleepSpy).toHaveBeenNthCalledWith(2, 200);
      expect(sleepSpy).toHaveBeenNthCalledWith(3, 400);
      expect(sleepSpy).toHaveBeenNthCalledWith(4, 800);
    }
  });
});
