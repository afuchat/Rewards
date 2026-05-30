import { AfuRewards } from "@afuchat/rewards";

export const rewards = new AfuRewards();

rewards.defineBadge("first_action", {
  name: "First Action",
  description: "Made your first SDK call",
  icon: "🌱",
});
rewards.defineBadge("century", {
  name: "Century",
  description: "Reached 100 XP",
  icon: "💯",
});
rewards.defineBadge("veteran", {
  name: "Veteran",
  description: "Reached 500 XP",
  icon: "⚡",
});
rewards.defineBadge("on_fire", {
  name: "On Fire",
  description: "Maintained a daily streak",
  icon: "🔥",
});
rewards.defineBadge("high_roller", {
  name: "High Roller",
  description: "Earned 100+ points",
  icon: "💰",
});
rewards.defineBadge("level_up", {
  name: "Level Up",
  description: "Reached Level 2+",
  icon: "🎯",
});

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

export const BADGE_IDS = [
  "first_action",
  "century",
  "veteran",
  "on_fire",
  "high_roller",
  "level_up",
] as const;

export const USERS = ["alice", "bob", "carol", "dave"] as const;
export type User = (typeof USERS)[number];

export const USER_AVATARS: Record<User, string> = {
  alice: "👩",
  bob: "👦",
  carol: "👩‍💻",
  dave: "🧑",
};
