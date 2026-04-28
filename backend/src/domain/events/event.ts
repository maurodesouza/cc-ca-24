export abstract class Event {
  constructor(private eventName: string) {}

  getEventName() {
    return this.eventName;
  }

  abstract getPayload<T>(): T
}
