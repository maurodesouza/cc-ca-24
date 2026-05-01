export interface PaymentAGateway {
  processPayment(): Promise<boolean>;
}

export class PaymentAGatewayHTTP implements PaymentAGateway {
  async processPayment(): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      console.log('Payment A gateway called')
      setTimeout(() => {
        if (Math.random() > 0.1) rejects(new Error("Payment A failed"))
        else resolve(true)
      }, 1000)
    })
  }
}
