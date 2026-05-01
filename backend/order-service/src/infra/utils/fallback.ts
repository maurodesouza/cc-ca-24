export class Fallback {
  fallbacks: Function[] = []
  current: Function | null = null

  async execute<T>(fn: Function): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      this.getNext()
      if (!this.current) throw new Error("all fallbacks failed")
      return await this.execute(this.current)
    }
  }

  add(fallback: Function) {
    this.fallbacks.push(fallback)
  }

  private getNext() {
    this.current = this.fallbacks.shift() || null
  }
}
