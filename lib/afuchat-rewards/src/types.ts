export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlockedAt: Date;
}

export interface StreakRecord {
  current: number;
  longest: number;
  lastUpdated: Date | null;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon?: string;
  stock?: number;
}

export interface RedemptionRecord {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  redeemedAt: Date;
}

export interface UserRecord {
  xp: number;
  points: number;
  badges: Badge[];
  streak: StreakRecord;
  redemptions: RedemptionRecord[];
}

export interface LeaderboardEntry {
  userId: string;
  value: number;
  rank: number;
}

export interface LevelConfig {
  formula: (xp: number) => number;
}

export interface AfuRewardsConfig {
  level?: LevelConfig;
}

export type EventCallback<T = unknown> = (payload: T) => void | Promise<void>;
