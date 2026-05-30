import type { Reward, RedemptionRecord } from "../types.js";
import type { MemoryStore } from "../storage/memory-store.js";

export type RewardDefinition = Omit<Reward, "id">;

export class RewardsModule {
  private catalog = new Map<string, Reward>();
  private stockRemaining = new Map<string, number>();

  constructor(private store: MemoryStore) {}

  defineReward(id: string, def: RewardDefinition): void {
    this.catalog.set(id, { ...def, id });
    if (def.stock !== undefined) {
      this.stockRemaining.set(id, def.stock);
    }
  }

  getCatalog(): Array<Reward & { stockRemaining?: number }> {
    return Array.from(this.catalog.values()).map((r) => ({
      ...r,
      stockRemaining: this.stockRemaining.has(r.id)
        ? this.stockRemaining.get(r.id)
        : undefined,
    }));
  }

  redeemReward(userId: string, rewardId: string): RedemptionRecord | null {
    const reward = this.catalog.get(rewardId);
    if (!reward) return null;

    const user = this.store.getOrCreate(userId);
    if (user.points < reward.pointsCost) return null;

    if (reward.stock !== undefined) {
      const left = this.stockRemaining.get(rewardId) ?? 0;
      if (left <= 0) return null;
      this.stockRemaining.set(rewardId, left - 1);
    }

    user.points = Math.max(0, user.points - reward.pointsCost);

    const record: RedemptionRecord = {
      id: `${userId}-${rewardId}-${Date.now()}`,
      rewardId,
      rewardName: reward.name,
      pointsSpent: reward.pointsCost,
      redeemedAt: new Date(),
    };

    user.redemptions.push(record);
    return record;
  }

  getRedemptions(userId: string): RedemptionRecord[] {
    return this.store.getOrCreate(userId).redemptions;
  }
}
