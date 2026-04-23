const VALID_ASSETS = ["BTC", "USD"];

export class Balance {
  constructor(
    public readonly fundId: string,
    public readonly assetId: string,
    public readonly quantity: number,
  ) {
    if (!VALID_ASSETS.includes(assetId)) throw new Error("Invalid asset ID");
  }

  static create(assetId: string, quantity: number) {
    const fundId = crypto.randomUUID();

    return new Balance(fundId, assetId, quantity);
  }
}
