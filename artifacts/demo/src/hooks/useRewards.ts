import { useCallback, useEffect, useState } from "react";
import { rewards, type User } from "../sdk";
import type { Badge, LeaderboardEntry, Reward, RedemptionRecord, StreakRecord } from "@afuchat/rewards";

export interface EventLogEntry {
  id: number;
  ts: string;
  event: string;
  payload: string;
  color: string;
}

export interface LiveCode {
  callLine: string;
  returnLine: string;
  eventName: string;
  eventPayloadLines: string[];
}

let logIdCounter = 0;

const EVENT_COLORS: Record<string, string> = {
  xp_added: "text-violet-400",
  points_added: "text-emerald-400",
  points_deducted: "text-red-400",
  badge_unlocked: "text-amber-400",
  streak_updated: "text-orange-400",
  streak_reset: "text-slate-400",
  reward_redeemed: "text-pink-400",
};

function formatPayload(event: string, payload: unknown): string {
  if (event === "xp_added") {
    const p = payload as { userId: string; amount: number; total: number };
    return `${p.userId}  +${p.amount} XP  →  total: ${p.total}`;
  }
  if (event === "points_added") {
    const p = payload as { userId: string; amount: number; total: number };
    return `${p.userId}  +${p.amount} pts  →  total: ${p.total}`;
  }
  if (event === "points_deducted") {
    const p = payload as { userId: string; amount: number; total: number };
    return `${p.userId}  -${p.amount} pts  →  total: ${p.total}`;
  }
  if (event === "badge_unlocked") {
    const p = payload as { userId: string; badge: Badge };
    return `${p.userId}  "${p.badge.name}" ${p.badge.icon ?? ""}`;
  }
  if (event === "streak_updated") {
    const p = payload as { userId: string; streak: StreakRecord };
    return `${p.userId}  current: ${p.streak.current}  longest: ${p.streak.longest}`;
  }
  if (event === "streak_reset") {
    const p = payload as { userId: string };
    return `${p.userId}  streak reset → 0`;
  }
  if (event === "reward_redeemed") {
    const p = payload as { userId: string; record: RedemptionRecord; pointsRemaining: number };
    return `${p.userId}  "${p.record.rewardName}"  pts left: ${p.pointsRemaining}`;
  }
  return JSON.stringify(payload);
}

export const DEFAULT_LIVE_CODE: LiveCode = {
  callLine: "// Click any action button to see live output",
  returnLine: "",
  eventName: "",
  eventPayloadLines: [],
};

export function useRewards() {
  const [tick, setTick] = useState(0);
  const [log, setLog] = useState<EventLogEntry[]>([]);
  const [liveCode, setLiveCode] = useState<LiveCode>(DEFAULT_LIVE_CODE);

  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const addLog = useCallback((event: string, payload: unknown) => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
    setLog((prev) => [
      {
        id: ++logIdCounter,
        ts,
        event,
        payload: formatPayload(event, payload),
        color: EVENT_COLORS[event] ?? "text-slate-400",
      },
      ...prev.slice(0, 99),
    ]);
  }, []);

  useEffect(() => {
    const EVENTS = [
      "xp_added",
      "points_added",
      "points_deducted",
      "badge_unlocked",
      "streak_updated",
      "streak_reset",
      "reward_redeemed",
    ];

    const handlers: Array<[string, (p: unknown) => void]> = EVENTS.map(
      (ev) => {
        const handler = (payload: unknown) => {
          addLog(ev, payload);
          forceUpdate();
        };
        rewards.on(ev, handler);
        return [ev, handler];
      },
    );

    return () => {
      handlers.forEach(([ev, h]) => rewards.off(ev, h));
    };
  }, [addLog, forceUpdate]);

  const getUserStats = useCallback(
    (userId: User) => ({
      xp: rewards.getXP(userId),
      points: rewards.getPoints(userId),
      level: rewards.getLevel(userId),
      streak: rewards.getStreak(userId),
      badges: rewards.getBadges(userId),
    }),
    [tick],
  );

  const getLeaderboard = useCallback(
    (type: "xp" | "points"): LeaderboardEntry[] =>
      rewards.getLeaderboard(type),
    [tick],
  );

  const addXP = useCallback((userId: User, amount: number) => {
    const total = rewards.addXP(userId, amount);
    const level = rewards.getLevel(userId);
    setLiveCode({
      callLine: `rewards.addXP("${userId}", ${amount})`,
      returnLine: `// → ${total}  (level ${level})`,
      eventName: "xp_added",
      eventPayloadLines: [
        `{`,
        `  userId: "${userId}",`,
        `  amount: ${amount},`,
        `  total: ${total}`,
        `}`,
      ],
    });
  }, []);

  const addPoints = useCallback((userId: User, amount: number) => {
    const total = rewards.addPoints(userId, amount);
    setLiveCode({
      callLine: `rewards.addPoints("${userId}", ${amount})`,
      returnLine: `// → ${total}`,
      eventName: "points_added",
      eventPayloadLines: [
        `{`,
        `  userId: "${userId}",`,
        `  amount: ${amount},`,
        `  total: ${total}`,
        `}`,
      ],
    });
  }, []);

  const deductPoints = useCallback((userId: User, amount: number) => {
    const total = rewards.deductPoints(userId, amount);
    setLiveCode({
      callLine: `rewards.deductPoints("${userId}", ${amount})`,
      returnLine: `// → ${total}`,
      eventName: "points_deducted",
      eventPayloadLines: [
        `{`,
        `  userId: "${userId}",`,
        `  amount: ${amount},`,
        `  total: ${total}`,
        `}`,
      ],
    });
  }, []);

  const unlockBadge = useCallback((userId: User, badgeId: string) => {
    const badge = rewards.unlockBadge(userId, badgeId);
    setLiveCode({
      callLine: `rewards.unlockBadge("${userId}", "${badgeId}")`,
      returnLine: badge
        ? `// → Badge { id: "${badgeId}", name: "${badge.name}" }`
        : `// → null  (already owned)`,
      eventName: badge ? "badge_unlocked" : "",
      eventPayloadLines: badge
        ? [
            `{`,
            `  userId: "${userId}",`,
            `  badge: {`,
            `    id: "${badge.id}",`,
            `    name: "${badge.name}",`,
            `    icon: "${badge.icon ?? ""}"`,
            `  }`,
            `}`,
          ]
        : [],
    });
  }, []);

  const updateStreak = useCallback((userId: User) => {
    rewards.updateStreak(userId);
    const streak = rewards.getStreak(userId);
    setLiveCode({
      callLine: `rewards.updateStreak("${userId}")`,
      returnLine: `// → { current: ${streak.current}, longest: ${streak.longest} }`,
      eventName: "streak_updated",
      eventPayloadLines: [
        `{`,
        `  userId: "${userId}",`,
        `  streak: {`,
        `    current: ${streak.current},`,
        `    longest: ${streak.longest}`,
        `  }`,
        `}`,
      ],
    });
  }, []);

  const resetStreak = useCallback((userId: User) => {
    rewards.resetStreak(userId);
    setLiveCode({
      callLine: `rewards.resetStreak("${userId}")`,
      returnLine: `// → void  (streak.current reset to 0)`,
      eventName: "streak_reset",
      eventPayloadLines: [`{`, `  userId: "${userId}"`, `}`],
    });
  }, []);

  const redeemReward = useCallback((userId: User, rewardId: string) => {
    const record = rewards.redeemReward(userId, rewardId);
    const pointsRemaining = rewards.getPoints(userId);
    if (record) {
      setLiveCode({
        callLine: `rewards.redeemReward("${userId}", "${rewardId}")`,
        returnLine: `// → RedemptionRecord { rewardName: "${record.rewardName}", pointsSpent: ${record.pointsSpent} }`,
        eventName: "reward_redeemed",
        eventPayloadLines: [
          `{`,
          `  userId: "${userId}",`,
          `  record: {`,
          `    rewardId: "${record.rewardId}",`,
          `    rewardName: "${record.rewardName}",`,
          `    pointsSpent: ${record.pointsSpent}`,
          `  },`,
          `  pointsRemaining: ${pointsRemaining}`,
          `}`,
        ],
      });
    } else {
      setLiveCode({
        callLine: `rewards.redeemReward("${userId}", "${rewardId}")`,
        returnLine: `// → null  (insufficient points or out of stock)`,
        eventName: "",
        eventPayloadLines: [],
      });
    }
  }, []);

  const getCatalog = useCallback(
    (): Array<Reward & { stockRemaining?: number }> => rewards.getCatalog(),
    [tick],
  );

  const getRedemptions = useCallback(
    (userId: User): RedemptionRecord[] => rewards.getRedemptions(userId),
    [tick],
  );

  return {
    getUserStats,
    getLeaderboard,
    getCatalog,
    getRedemptions,
    addXP,
    addPoints,
    deductPoints,
    unlockBadge,
    updateStreak,
    resetStreak,
    redeemReward,
    log,
    liveCode,
  };
}
