const VALID_ASSETS = ["BTC", "USD"];

export class Balance {
  constructor(
    public readonly assetId: string,
    public quantity: number,
  ) {
    if (!VALID_ASSETS.includes(assetId)) throw new Error("Invalid asset ID");
  }

  static create(assetId: string, quantity: number) {
    return new Balance(assetId, quantity);
  }
}
