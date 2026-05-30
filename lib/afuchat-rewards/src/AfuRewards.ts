import { MemoryStore } from "./storage/memory-store.js";
import type { SerializedStore } from "./storage/memory-store.js";
import { XPModule } from "./modules/xp.js";
import { PointsModule } from "./modules/points.js";
import { LevelsModule } from "./modules/levels.js";
import { BadgesModule } from "./modules/badges.js";
import type { BadgeDefinition } from "./modules/badges.js";
import { StreaksModule } from "./modules/streaks.js";
import { LeaderboardModule } from "./modules/leaderboard.js";
import { EventsModule } from "./modules/events.js";
import { RewardsModule } from "./modules/rewards.js";
import type { RewardDefinition } from "./modules/rewards.js";
import type {
  AfuRewardsConfig,
  Badge,
  EventCallback,
  LeaderboardEntry,
  Reward,
  RedemptionRecord,
  StreakRecord,
} from "./types.js";

export class AfuRewards {
  private store: MemoryStore;
  private xp: XPModule;
  private points: PointsModule;
  private levels: LevelsModule;
  private badges: BadgesModule;
  private streaks: StreaksModule;
  private leaderboard: LeaderboardModule;
  private events: EventsModule;
  private rewardsCatalog: RewardsModule;

  constructor(config: AfuRewardsConfig = {}) {
    this.store = new MemoryStore();
    this.xp = new XPModule(this.store);
    this.points = new PointsModule(this.store);
    this.levels = new LevelsModule(this.store, config.level);
    this.badges = new BadgesModule(this.store);
    this.streaks = new StreaksModule(this.store);
    this.leaderboard = new LeaderboardModule(this.store);
    this.events = new EventsModule();
    this.rewardsCatalog = new RewardsModule(this.store);
  }

  // ─── XP ────────────────────────────────────────────────────────────────────

  addXP(userId: string, amount: number): number {
    const total = this.xp.addXP(userId, amount);
    this.events.emit("xp_added", { userId, amount, total });
    return total;
  }

  getXP(userId: string): number {
    return this.xp.getXP(userId);
  }

  // ─── Points ────────────────────────────────────────────────────────────────

  addPoints(userId: string, amount: number): number {
    const total = this.points.addPoints(userId, amount);
    this.events.emit("points_added", { userId, amount, total });
    return total;
  }

  deductPoints(userId: string, amount: number): number {
    const total = this.points.deductPoints(userId, amount);
    this.events.emit("points_deducted", { userId, amount, total });
    return total;
  }

  getPoints(userId: string): number {
    return this.points.getPoints(userId);
  }

  // ─── Levels ────────────────────────────────────────────────────────────────

  getLevel(userId: string): number {
    return this.levels.getLevel(userId);
  }

  calculateLevel(xp: number): number {
    return this.levels.calculateLevel(xp);
  }

  // ─── Badges ────────────────────────────────────────────────────────────────

  defineBadge(id: string, definition: BadgeDefinition): void {
    this.badges.defineBadge(id, definition);
  }

  unlockBadge(userId: string, badgeId: string): Badge | null {
    const badge = this.badges.unlockBadge(userId, badgeId);
    if (badge) {
      this.events.emit("badge_unlocked", { userId, badge });
    }
    return badge;
  }

  getBadges(userId: string): Badge[] {
    return this.badges.getBadges(userId);
  }

  hasBadge(userId: string, badgeId: string): boolean {
    return this.badges.hasBadge(userId, badgeId);
  }

  // ─── Streaks ───────────────────────────────────────────────────────────────

  updateStreak(userId: string): StreakRecord {
    const streak = this.streaks.updateStreak(userId);
    this.events.emit("streak_updated", { userId, streak });
    return streak;
  }

  getStreak(userId: string): StreakRecord {
    return this.streaks.getStreak(userId);
  }

  resetStreak(userId: string): void {
    this.streaks.resetStreak(userId);
    this.events.emit("streak_reset", { userId });
  }

  // ─── Rewards Catalog ───────────────────────────────────────────────────────

  defineReward(id: string, def: RewardDefinition): void {
    this.rewardsCatalog.defineReward(id, def);
  }

  getCatalog(): Array<Reward & { stockRemaining?: number }> {
    return this.rewardsCatalog.getCatalog();
  }

  redeemReward(userId: string, rewardId: string): RedemptionRecord | null {
    const record = this.rewardsCatalog.redeemReward(userId, rewardId);
    if (record) {
      const pointsRemaining = this.points.getPoints(userId);
      this.events.emit("reward_redeemed", { userId, record, pointsRemaining });
    }
    return record;
  }

  getRedemptions(userId: string): RedemptionRecord[] {
    return this.rewardsCatalog.getRedemptions(userId);
  }

  // ─── Leaderboard ───────────────────────────────────────────────────────────

  getLeaderboard(
    type: "xp" | "points",
    limit = 10,
  ): LeaderboardEntry[] {
    return this.leaderboard.getLeaderboard(type, limit);
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  on<T = unknown>(eventName: string, callback: EventCallback<T>): void {
    this.events.on(eventName, callback);
  }

  off<T = unknown>(eventName: string, callback: EventCallback<T>): void {
    this.events.off(eventName, callback);
  }

  emit<T = unknown>(eventName: string, payload: T): void {
    this.events.emit(eventName, payload);
  }

  removeAllListeners(eventName?: string): void {
    this.events.removeAllListeners(eventName);
  }

  // ─── Persistence ───────────────────────────────────────────────────────────

  async persist(filePath: string): Promise<void> {
    const { writeFile } = await import("node:fs/promises");
    const snapshot = this.store.serialize();
    await writeFile(filePath, JSON.stringify(snapshot, null, 2), "utf8");
  }

  async restore(filePath: string): Promise<void> {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(filePath, "utf8");
    const snapshot = JSON.parse(raw) as SerializedStore;
    if (snapshot.version !== 1) {
      throw new Error(
        `Unsupported snapshot version: ${(snapshot as { version: number }).version}`,
      );
    }
    this.store.deserialize(snapshot);
  }

  snapshot(): SerializedStore {
    return this.store.serialize();
  }

  loadSnapshot(snapshot: SerializedStore): void {
    if (snapshot.version !== 1) {
      throw new Error(
        `Unsupported snapshot version: ${(snapshot as { version: number }).version}`,
      );
    }
    this.store.deserialize(snapshot);
  }
}
