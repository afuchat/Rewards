import AfuRewards from "./src/index.js";

const rewards = new AfuRewards();

// ─── Event system — wire up reward logic before anything else ────────────────

rewards.on("user_posted", (user: { id: string }) => {
  rewards.addXP(user.id, 10);
  rewards.addPoints(user.id, 5);
  rewards.updateStreak(user.id);
});

rewards.on("badge_unlocked", (payload: { userId: string; badge: { name: string } }) => {
  console.log(`🏅 ${payload.userId} unlocked badge: ${payload.badge.name}`);
});

// ─── Pre-define badge metadata (optional) ───────────────────────────────────

rewards.defineBadge("Starter", {
  name: "Starter",
  description: "Completed your first action",
  icon: "🌱",
});

rewards.defineBadge("Prolific", {
  name: "Prolific",
  description: "Posted 5 times",
  icon: "✍️",
});

// ─── Simulate user actions ───────────────────────────────────────────────────

console.log("\n=== AfuRewards Demo ===\n");

// User 1 posts 3 times
rewards.emit("user_posted", { id: "alice" });
rewards.emit("user_posted", { id: "alice" });
rewards.emit("user_posted", { id: "alice" });
rewards.unlockBadge("alice", "Starter");

// User 2 posts once
rewards.emit("user_posted", { id: "bob" });
rewards.unlockBadge("bob", "Starter");

// User 3 gets XP directly
rewards.addXP("carol", 500);
rewards.addPoints("carol", 100);
rewards.unlockBadge("carol", "Starter");
rewards.unlockBadge("carol", "Prolific");

// ─── Print stats ─────────────────────────────────────────────────────────────

for (const userId of ["alice", "bob", "carol"]) {
  console.log(`\n── ${userId} ──────────────────────────`);
  console.log(`  XP:     ${rewards.getXP(userId)}`);
  console.log(`  Points: ${rewards.getPoints(userId)}`);
  console.log(`  Level:  ${rewards.getLevel(userId)}`);
  console.log(`  Streak: ${rewards.getStreak(userId).current} day(s)`);
  console.log(`  Badges: ${rewards.getBadges(userId).map((b) => b.name).join(", ")}`);
}

// ─── Leaderboards ────────────────────────────────────────────────────────────

console.log("\n── XP Leaderboard ──────────────────────");
for (const entry of rewards.getLeaderboard("xp")) {
  console.log(`  #${entry.rank}  ${entry.userId.padEnd(8)} ${entry.value} XP`);
}

console.log("\n── Points Leaderboard ──────────────────");
for (const entry of rewards.getLeaderboard("points")) {
  console.log(`  #${entry.rank}  ${entry.userId.padEnd(8)} ${entry.value} pts`);
}

// ─── Custom level formula ────────────────────────────────────────────────────

console.log("\n── Custom level config ─────────────────");
const customRewards = new AfuRewards({
  level: { formula: (xp) => Math.floor(xp / 500) + 1 },
});
customRewards.addXP("dave", 1200);
console.log(`  dave: ${customRewards.getXP("dave")} XP → Level ${customRewards.getLevel("dave")}`);
