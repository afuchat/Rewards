import type { EventCallback } from "../types.js";

export class EventsModule {
  private listeners = new Map<string, EventCallback<unknown>[]>();

  on<T = unknown>(eventName: string, callback: EventCallback<T>): void {
    const existing = this.listeners.get(eventName) ?? [];
    existing.push(callback as EventCallback<unknown>);
    this.listeners.set(eventName, existing);
  }

  off<T = unknown>(eventName: string, callback: EventCallback<T>): void {
    const existing = this.listeners.get(eventName);
    if (!existing) return;
    this.listeners.set(
      eventName,
      existing.filter((cb) => cb !== (callback as EventCallback<unknown>)),
    );
  }

  emit<T = unknown>(eventName: string, payload: T): void {
    const callbacks = this.listeners.get(eventName);
    if (!callbacks) return;
    for (const cb of callbacks) {
      void cb(payload);
    }
  }

  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}
