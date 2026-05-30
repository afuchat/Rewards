import { useState } from "react";
import { useRewards } from "../hooks/useRewards";
import { BADGE_IDS, USER_AVATARS, USERS, type User } from "../sdk";
import { cn } from "@/lib/utils";

const XP_PER_LEVEL_BASE = 100;

function xpForLevel(level: number) {
  return Math.pow(level - 1, 2) * XP_PER_LEVEL_BASE;
}

function xpProgress(xp: number, level: number) {
  const start = xpForLevel(level);
  const end = xpForLevel(level + 1);
  const pct = Math.min(100, Math.round(((xp - start) / (end - start)) * 100));
  return { start, end, pct };
}

const BADGE_META: Record<string, { icon: string; name: string }> = {
  first_action: { icon: "🌱", name: "First Action" },
  century: { icon: "💯", name: "Century" },
  veteran: { icon: "⚡", name: "Veteran" },
  on_fire: { icon: "🔥", name: "On Fire" },
  high_roller: { icon: "💰", name: "High Roller" },
  level_up: { icon: "🎯", name: "Level Up" },
};

export default function Home() {
  const [activeUser, setActiveUser] = useState<User>("alice");
  const [lbType, setLbType] = useState<"xp" | "points">("xp");

  const {
    getUserStats,
    getLeaderboard,
    addXP,
    addPoints,
    deductPoints,
    unlockBadge,
    updateStreak,
    resetStreak,
    log,
  } = useRewards();

  const stats = getUserStats(activeUser);
  const leaderboard = getLeaderboard(lbType);
  const { pct, end } = xpProgress(stats.xp, stats.level);
  const unlockedIds = new Set(stats.badges.map((b) => b.id));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between bg-card/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">
              AfuRewards SDK
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive demo — all features running live in your browser
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-muted px-3 py-1.5 rounded-full border border-border text-muted-foreground">
            npm install @afuchat/rewards
          </span>
          <span className="text-xs bg-primary/15 text-primary border border-primary/25 px-2.5 py-1 rounded-full font-medium">
            v1.0.0
          </span>
          <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full font-medium">
            0 deps
          </span>
        </div>
      </header>

      <div className="flex-1 p-5 flex flex-col gap-5 max-w-[1400px] mx-auto w-full">
        {/* User switcher */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Active user
          </span>
          <div className="flex gap-2">
            {USERS.map((u) => (
              <button
                key={u}
                onClick={() => setActiveUser(u)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                  activeUser === u
                    ? "bg-primary text-primary-foreground border-primary/60 shadow-md"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80",
                )}
              >
                <span className="text-base">{USER_AVATARS[u]}</span>
                <span className="capitalize">{u}</span>
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded font-mono",
                    activeUser === u
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  Lv {getUserStats(u).level}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1fr_1fr_280px] gap-5">
          {/* Stats card */}
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Stats — {activeUser}
            </h2>

            {/* XP + Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    Experience
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {stats.xp} / {end} XP
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {pct}% to level {stats.level + 1}
                </span>
                <span className="font-bold text-primary text-base">
                  Level {stats.level}
                </span>
              </div>
            </div>

            {/* Points */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/60 border border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <span className="text-sm text-muted-foreground">Points</span>
              </div>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {stats.points}
              </span>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/60 border border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Daily streak
                  </span>
                  <p className="text-xs text-muted-foreground/60">
                    Best: {stats.streak.longest} day(s)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-orange-400">
                  {stats.streak.current}
                </span>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>

            {/* Badges */}
            {stats.badges.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2.5 font-medium uppercase tracking-wider">
                  Badges ({stats.badges.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.badges.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs px-2.5 py-1.5 rounded-lg font-medium"
                    >
                      <span>{b.icon ?? "🏅"}</span>
                      <span>{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions card */}
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Actions
            </h2>

            {/* XP actions */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <span>⭐</span> Add XP
              </p>
              <div className="flex gap-2">
                {[10, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => addXP(activeUser, amt)}
                    className="flex-1 py-2 rounded-lg bg-violet-600/15 border border-violet-500/30 text-violet-300 text-sm font-semibold hover:bg-violet-600/25 transition-colors active:scale-95"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Points actions */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <span>💰</span> Points
              </p>
              <div className="flex gap-2">
                {[10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => addPoints(activeUser, amt)}
                    className="flex-1 py-2 rounded-lg bg-emerald-600/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold hover:bg-emerald-600/25 transition-colors active:scale-95"
                  >
                    +{amt}
                  </button>
                ))}
                <button
                  onClick={() => deductPoints(activeUser, 10)}
                  className="flex-1 py-2 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-600/25 transition-colors active:scale-95"
                >
                  −10
                </button>
              </div>
            </div>

            {/* Streak actions */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <span>🔥</span> Streak
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStreak(activeUser)}
                  className="flex-1 py-2 rounded-lg bg-orange-600/15 border border-orange-500/30 text-orange-300 text-sm font-semibold hover:bg-orange-600/25 transition-colors active:scale-95"
                >
                  Check in today
                </button>
                <button
                  onClick={() => resetStreak(activeUser)}
                  className="px-4 py-2 rounded-lg bg-muted border border-border text-muted-foreground text-sm hover:text-foreground transition-colors active:scale-95"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Badge unlock */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <span>🏅</span> Unlock badge
              </p>
              <div className="grid grid-cols-2 gap-2">
                {BADGE_IDS.map((id) => {
                  const meta = BADGE_META[id];
                  const owned = unlockedIds.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => unlockBadge(activeUser, id)}
                      disabled={owned}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors active:scale-95",
                        owned
                          ? "bg-amber-500/10 border-amber-500/25 text-amber-400 cursor-default"
                          : "bg-muted/50 border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-300",
                      )}
                    >
                      <span className="text-base">{meta.icon}</span>
                      <span className="truncate text-xs font-medium">
                        {meta.name}
                      </span>
                      {owned && (
                        <span className="ml-auto text-xs text-amber-500">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Leaderboard
              </h2>
              <div className="flex rounded-lg overflow-hidden border border-border text-xs">
                {(["xp", "points"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLbType(t)}
                    className={cn(
                      "px-3 py-1 font-medium transition-colors",
                      lbType === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t === "xp" ? "XP" : "Pts"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {leaderboard.map((entry) => {
                const rankColors = [
                  "text-amber-400",
                  "text-slate-300",
                  "text-orange-600",
                ];
                const rankIcons = ["🥇", "🥈", "🥉"];
                const isActive = entry.userId === activeUser;
                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      isActive
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/40 border-border/50",
                    )}
                  >
                    <span className="text-lg w-6 text-center">
                      {rankIcons[entry.rank - 1] ?? `#${entry.rank}`}
                    </span>
                    <span className="text-xl">
                      {USER_AVATARS[entry.userId as User] ?? "🙂"}
                    </span>
                    <span className="flex-1 text-sm font-medium capitalize">
                      {entry.userId}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-sm font-bold",
                        rankColors[entry.rank - 1] ?? "text-muted-foreground",
                      )}
                    >
                      {entry.value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Feature callout */}
            <div className="mt-auto pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-mono text-primary">rewards.getLeaderboard("xp")</span>
                {" "}returns all users sorted by rank. Updates live as you add XP or points above.
              </p>
            </div>
          </div>
        </div>

        {/* Event log */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live event log
              <span className="text-muted-foreground/50 font-normal normal-case tracking-normal ml-1">
                — fires automatically on every SDK action via{" "}
                <span className="font-mono text-primary/70">rewards.on()</span>
              </span>
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {log.length} events
            </span>
          </div>

          <div className="h-44 overflow-y-auto font-mono text-xs space-y-1 rounded-lg bg-background/60 border border-border/50 p-3">
            {log.length === 0 && (
              <p className="text-muted-foreground/50 italic">
                Trigger an action above to see events appear here...
              </p>
            )}
            {log.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <span className="text-muted-foreground/50 shrink-0 w-28">
                  {entry.ts}
                </span>
                <span
                  className={cn(
                    "shrink-0 w-32 font-semibold",
                    entry.color,
                  )}
                >
                  {entry.event}
                </span>
                <span className="text-foreground/80">{entry.payload}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code snippet footer */}
        <div className="bg-card border border-border rounded-xl p-5 grid grid-cols-3 gap-5 text-xs">
          <div className="space-y-1.5">
            <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">
              Zero setup
            </p>
            <pre className="font-mono text-violet-300 leading-relaxed">
              {`import AfuRewards from "@afuchat/rewards"

const rewards = new AfuRewards()
rewards.addXP("user1", 50)
rewards.unlockBadge("user1", "Starter")`}
            </pre>
          </div>
          <div className="space-y-1.5">
            <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">
              Event-driven
            </p>
            <pre className="font-mono text-emerald-300 leading-relaxed">
              {`rewards.on("user_posted", (user) => {
  rewards.addXP(user.id, 10)
  rewards.addPoints(user.id, 5)
})

rewards.emit("user_posted", { id: "u1" })`}
            </pre>
          </div>
          <div className="space-y-1.5">
            <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">
              Persistence
            </p>
            <pre className="font-mono text-amber-300 leading-relaxed">
              {`// Save state to disk
await rewards.persist("./state.json")

// Restore on restart
await rewards.restore("./state.json")

// Or use in-memory snapshots
const snap = rewards.snapshot()`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
