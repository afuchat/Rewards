import { AfuRewards } from "@afuchat/rewards";

export const rewards = new AfuRewards();

// ─── Badges ────────────────────────────────────────────────────────────────

rewards.defineBadge("first_action", { name: "First Action", description: "Made your first SDK call", icon: "🌱" });
rewards.defineBadge("century",      { name: "Century",      description: "Reached 100 XP",            icon: "💯" });
rewards.defineBadge("veteran",      { name: "Veteran",      description: "Reached 500 XP",            icon: "⚡" });
rewards.defineBadge("on_fire",      { name: "On Fire",      description: "Maintained a daily streak", icon: "🔥" });
rewards.defineBadge("high_roller",  { name: "High Roller",  description: "Earned 100+ points",        icon: "💰" });
rewards.defineBadge("level_up",     { name: "Level Up",     description: "Reached Level 2+",          icon: "🎯" });

// ─── Reward catalog ────────────────────────────────────────────────────────

rewards.defineReward("mystery_box", {
  name: "Mystery Box",
  description: "A random surprise from the rewards vault — could be anything!",
  pointsCost: 30,
  icon: "🎁",
});
rewards.defineReward("game_credit", {
  name: "Game Credit",
  description: "$5 credit redeemable on any supported gaming platform.",
  pointsCost: 50,
  icon: "🎮",
});
rewards.defineReward("event_pass", {
  name: "Event Pass",
  description: "VIP access to the next community event or live stream.",
  pointsCost: 75,
  icon: "🎟️",
});
rewards.defineReward("hall_of_fame", {
  name: "Hall of Fame",
  description: "Get a featured spot on the all-time leaderboard wall.",
  pointsCost: 100,
  icon: "🏆",
});
rewards.defineReward("pro_badge", {
  name: "Pro Badge",
  description: "Exclusive animated profile badge visible to all users.",
  pointsCost: 150,
  icon: "⭐",
});
rewards.defineReward("premium_month", {
  name: "Premium Month",
  description: "Full 30 days of premium membership with all perks unlocked.",
  pointsCost: 200,
  icon: "💎",
});

// ─── Seed users ────────────────────────────────────────────────────────────

rewards.addXP("alice", 250);
rewards.addPoints("alice", 80);
rewards.unlockBadge("alice", "first_action");
rewards.unlockBadge("alice", "century");

rewards.addXP("bob", 120);
rewards.addPoints("bob", 35);
rewards.unlockBadge("bob", "first_action");

rewards.addXP("carol", 480);
rewards.addPoints("carol", 140);
rewards.unlockBadge("carol", "first_action");
rewards.unlockBadge("carol", "century");
rewards.unlockBadge("carol", "high_roller");
rewards.unlockBadge("carol", "level_up");

// ─── Exports ───────────────────────────────────────────────────────────────

export const BADGE_IDS = [
  "first_action", "century", "veteran", "on_fire", "high_roller", "level_up",
] as const;

export const REWARD_IDS = [
  "mystery_box", "game_credit", "event_pass", "hall_of_fame", "pro_badge", "premium_month",
] as const;

export const USERS = ["alice", "bob", "carol", "dave"] as const;
export type User = (typeof USERS)[number];

export const USER_AVATARS: Record<User, string> = {
  alice: "👩",
  bob: "👦",
  carol: "👩‍💻",
  dave: "🧑",
};
