import type { LevelConfig } from "../types.js";
import type { MemoryStore } from "../storage/memory-store.js";

const DEFAULT_FORMULA = (xp: number): number =>
  Math.floor(Math.sqrt(xp / 100)) + 1;

export class LevelsModule {
  private formula: (xp: number) => number;

  constructor(
    private store: MemoryStore,
    config?: LevelConfig,
  ) {
    this.formula = config?.formula ?? DEFAULT_FORMULA;
  }

  calculateLevel(xp: number): number {
    return this.formula(xp);
  }

  getLevel(userId: string): number {
    const xp = this.store.getOrCreate(userId).xp;
    return this.calculateLevel(xp);
  }
}
