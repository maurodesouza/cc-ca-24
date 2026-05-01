export interface PaymentBGateway {
  processPayment(): Promise<boolean>;
}

export class PaymentBGatewayHTTP implements PaymentBGateway {
  async processPayment(): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      console.log('Payment B gateway called')
      setTimeout(() => {
        if (Math.random() > 0.1) rejects(new Error("Payment B failed"))
        else resolve(true)
      }, 1000)
    })
  }
}
