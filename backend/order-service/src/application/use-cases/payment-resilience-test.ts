import { inject } from "../../infra/utils/registry";

import { PaymentAGatewayHTTP } from "../../infra/gateway/payment-A-gateway";
import { PaymentBGatewayHTTP } from "../../infra/gateway/payment-B-gateway";
import { PaymentCGatewayHTTP } from "../../infra/gateway/payment-C-gateway";
import { PaymentDGatewayHTTP } from "../../infra/gateway/payment-D-gateway";

import { Retry } from "../../infra/utils/retry";
import { Fallback } from "../../infra/utils/fallback";
import { CircuitBreaker } from "../../infra/utils/circuit-breaker";

export class PaymentResilienceTest {
  @inject("paymentAGateway")
  private readonly paymentAGateway!: PaymentAGatewayHTTP;
  @inject("paymentBGateway")
  private readonly paymentBGateway!: PaymentBGatewayHTTP;
  @inject("paymentCGateway")
  private readonly paymentCGateway!: PaymentCGatewayHTTP;
  @inject("paymentDGateway")
  private readonly paymentDGateway!: PaymentDGatewayHTTP;

  async execute(): Promise<void> {
    const paymentABreaker = new CircuitBreaker(async () => await this.paymentAGateway.processPayment(), {
      threshold: 3,
      timeout: 5 * 1000, // 5 seconds
      resetTimeout: 10 * 1000, // 10 seconds
    })

    const paymentBBreaker = new CircuitBreaker(async () => await this.paymentBGateway.processPayment(), {
      threshold: 3,
      timeout: 5 * 1000, // 5 seconds
      resetTimeout: 10 * 1000, // 10 seconds
    })

    const paymentCBreaker = new CircuitBreaker(async () => await this.paymentCGateway.processPayment(), {
      threshold: 3,
      timeout: 5 * 1000, // 5 seconds
      resetTimeout: 10 * 1000, // 10 seconds
    })

    const paymentDBreaker = new CircuitBreaker(async () => await this.paymentDGateway.processPayment(), {
      threshold: 3,
      timeout: 5 * 1000, // 5 seconds
      resetTimeout: 1 * 60 * 1000, // 1 minute
    })

    const fallback = new Fallback()

    fallback.add(async () => await Retry.execute(async () => await paymentBBreaker.execute(), 5))
    fallback.add(async () => await Retry.execute(async () => await paymentCBreaker.execute(), 5))
    fallback.add(async () => await Retry.execute(async () => await paymentDBreaker.execute(), 5))

    const output = await fallback.execute(async () => await Retry.execute(async () => await paymentABreaker.execute(), 5))

    console.log('output', output)
  }
}
