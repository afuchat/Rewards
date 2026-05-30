import type { MemoryStore } from "../storage/memory-store.js";

export class XPModule {
  constructor(private store: MemoryStore) {}

  addXP(userId: string, amount: number): number {
    if (amount <= 0) throw new Error("XP amount must be positive");
    const user = this.store.getOrCreate(userId);
    user.xp += amount;
    return user.xp;
  }

  getXP(userId: string): number {
    return this.store.getOrCreate(userId).xp;
  }
}
