import type { MemoryStore } from "../storage/memory-store.js";

export class PointsModule {
  constructor(private store: MemoryStore) {}

  addPoints(userId: string, amount: number): number {
    if (amount <= 0) throw new Error("Points amount must be positive");
    const user = this.store.getOrCreate(userId);
    user.points += amount;
    return user.points;
  }

  deductPoints(userId: string, amount: number): number {
    if (amount <= 0) throw new Error("Deduction amount must be positive");
    const user = this.store.getOrCreate(userId);
    user.points = Math.max(0, user.points - amount);
    return user.points;
  }

  getPoints(userId: string): number {
    return this.store.getOrCreate(userId).points;
  }
}
