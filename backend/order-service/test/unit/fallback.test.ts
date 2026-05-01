import { Fallback } from "../../src/infra/utils/fallback";
import { Retry } from "../../src/infra/utils/retry";
import * as sleepModule from "../../src/infra/utils/sleep";

describe("Retry", () => {
  test("Deve realizar o fallback quando houver falha", async () => {
    const message = "success";
    const error = new Error("fail");

    {
      const mainFn = jest.fn().mockRejectedValueOnce(error);
      const fallbackFn = jest.fn().mockResolvedValue(message);

      const fallback = new Fallback();

      fallback.add(fallbackFn)
      const result = await fallback.execute(mainFn)

      expect(result).toBe(message);
      expect(mainFn).toHaveBeenCalledTimes(1);
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    }
  });

  test("Deve jogar erro quando rodar todos os fallbacks", async () => {
    const error = new Error("fail");

    {
      const fn = jest.fn().mockRejectedValue(error)

      const fallback = new Fallback();
      fallback.add(fn)
      fallback.add(fn)

      await expect(async () => await fallback.execute(fn)).rejects.toThrow("all fallbacks failed");
    }
  });
});
