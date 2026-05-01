enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

type CircuitBreakerOptions = {
  threshold: number;
  timeout: number
  resetTimeout: number;
}

const DEFAULT_CIRCUIT_BREAKER_OPTIONS: CircuitBreakerOptions = {
  threshold: 5,
  timeout: 5000,
  resetTimeout: 30000,
}

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private halfOpenExecutions = 0
  private lastFailureTime: number = 0;

  private options = {} as CircuitBreakerOptions;

  constructor(readonly fn: Function, options?: Partial<CircuitBreakerOptions>) {
    this.options = { ...DEFAULT_CIRCUIT_BREAKER_OPTIONS, ...options };
  }

  async execute<T>(): Promise<T> {
    if (this.isAvailableToReset()) {
      this.state = CircuitBreakerState.HALF_OPEN;
    }

    if (this.isOpen()) throw new Error("[circuit-breaker]: is OPEN");
    if (!this.isExecutionAllowed()) throw new Error("[circuit-breaker]: HALF_OPEN execution already in progress");

    if (this.isHalfOpen()) this.halfOpenExecutions++;

    try {
      const output = await Promise.race([
        this.fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("[circuit-breaker]: timeout")), this.options.timeout))
      ]) as T;

      this.onSuccess();
      return output;
    } catch (error) {
      this.onFailure();
      throw error
    }
  }

  private isOpen() {
    return this.state === CircuitBreakerState.OPEN;
  }

  private isClosed() {
    return this.state === CircuitBreakerState.CLOSED;
  }


  private isHalfOpen() {
    return this.state === CircuitBreakerState.HALF_OPEN;
  }

  private isAvailableToReset() {
    return this.isOpen() && Date.now() - this.lastFailureTime > this.options.resetTimeout;
  }

  private isExecutionAllowed() {
    if (this.isClosed()) return true

    return this.isHalfOpen() && this.halfOpenExecutions === 0;
  }

  private onSuccess() {
    this.failureCount = 0;
    this.halfOpenExecutions = 0;
    this.state = CircuitBreakerState.CLOSED;
  }

  private onFailure() {
    if (this.isHalfOpen()) {
      this.halfOpenExecutions = 0;
      this.state = CircuitBreakerState.OPEN;
      return;
    }

    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.threshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }
}
