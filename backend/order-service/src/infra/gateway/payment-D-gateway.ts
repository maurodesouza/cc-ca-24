export interface PaymentDGateway {
  processPayment(): Promise<boolean>;
}

export class PaymentDGatewayHTTP implements PaymentDGateway {
  async processPayment(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('Payment D gateway called')
      setTimeout(() => resolve(true), 1000)
    })
  }
}
