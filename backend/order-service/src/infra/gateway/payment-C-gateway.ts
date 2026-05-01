export interface PaymentCGateway {
  processPayment(): Promise<boolean>;
}

export class PaymentCGatewayHTTP implements PaymentCGateway {
  async processPayment(): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      console.log('Payment C gateway called')
      setTimeout(() => {
        if (Math.random() > 0.1) rejects(new Error("Payment C failed"))
        else resolve(true)
      }, 1000)
    })
  }
}
