import { sleep } from "../../utils/sleep";

export class Retry {
  static async execute<T>(fn: Function, retries = 3, delay = 1000, exponentialIncrement = 1): Promise<T> {
    try {
      return await fn()
    } catch (error: unknown) {
      if (retries > 0) {
        await sleep(delay)
        return await Retry.execute(fn, retries - 1, delay * exponentialIncrement, exponentialIncrement);
      }

      throw new Error("max retries exceeded")
    }
  }
}
