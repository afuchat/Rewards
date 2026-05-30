import { useState, useCallback } from "react";
import { useRewards, type LiveCode, DEFAULT_LIVE_CODE } from "../hooks/useRewards";
import { BADGE_IDS, USER_AVATARS, USERS, type User } from "../sdk";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────────────────

type Tab = "playground" | "quickstart" | "api";

const BADGE_META: Record<string, { icon: string; name: string }> = {
  first_action: { icon: "🌱", name: "First Action" },
  century: { icon: "💯", name: "Century" },
  veteran: { icon: "⚡", name: "Veteran" },
  on_fire: { icon: "🔥", name: "On Fire" },
  high_roller: { icon: "💰", name: "High Roller" },
  level_up: { icon: "🎯", name: "Level Up" },
};

// ─── Syntax highlighter ─────────────────────────────────────────────────────

type Tok = [string, string]; // [text, className]

function tokenizeLine(line: string): Tok[] {
  const result: Tok[] = [];
  let s = line;
  while (s.length) {
    let m: RegExpMatchArray | null;
    if ((m = s.match(/^(\/\/.*)/))) {
      result.push([m[1], "text-slate-500 italic"]);
      s = s.slice(m[1].length);
    } else if ((m = s.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/))) {
      result.push([m[1], "text-emerald-300"]);
      s = s.slice(m[1].length);
    } else if ((m = s.match(/^(const|let|var|new|return|await|async|import|from|export|function|class|type|interface|extends)\b/))) {
      result.push([m[1], "text-violet-400"]);
      s = s.slice(m[1].length);
    } else if ((m = s.match(/^(true|false|null|undefined)\b/))) {
      result.push([m[1], "text-orange-400"]);
      s = s.slice(m[1].length);
    } else if ((m = s.match(/^(\d+(?:\.\d+)?)\b/))) {
      result.push([m[1], "text-amber-300"]);
      s = s.slice(m[1].length);
    } else if ((m = s.match(/^([A-Z][a-zA-Z0-9_]*)/))) {
      result.push([m[1], "text-yellow-200"]);
      s = s.slice(m[1].length);
    } else if ((m = s.match(/^(\.)([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/))) {
      result.push([".", "text-slate-500"]);
      result.push([m[2], "text-blue-300"]);
      s = s.slice(m[0].length);
    } else if ((m = s.match(/^(\.)([a-zA-Z_][a-zA-Z0-9_]*)/))) {
      result.push([".", "text-slate-500"]);
      result.push([m[2], "text-sky-300"]);
      s = s.slice(m[0].length);
    } else if ((m = s.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/))) {
      result.push([m[1], "text-slate-200"]);
      s = s.slice(m[1].length);
    } else if ((m = s.match(/^(\s+)/))) {
      result.push([m[1], ""]);
      s = s.slice(m[1].length);
    } else {
      result.push([s[0], "text-slate-400"]);
      s = s.slice(1);
    }
  }
  return result;
}

function HL({ code, dim }: { code: string; dim?: boolean }) {
  return (
    <span className={cn(dim && "opacity-50")}>
      {tokenizeLine(code).map(([text, cls], i) => (
        <span key={i} className={cls}>
          {text}
        </span>
      ))}
    </span>
  );
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyBtn({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [text]);
  return (
    <button
      onClick={copy}
      className={cn(
        "text-[10px] font-mono px-2 py-0.5 rounded border transition-all",
        copied
          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
          : "bg-slate-700/60 border-slate-600/50 text-slate-400 hover:text-slate-200 hover:bg-slate-600/60",
        className,
      )}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

// ─── Static code block ───────────────────────────────────────────────────────

function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative group rounded-lg bg-[#0d1117] border border-slate-700/50 overflow-hidden",
        className,
      )}
    >
      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyBtn text={code} />
      </div>
      <pre className="p-4 text-[13px] font-mono leading-6 overflow-x-auto">
        {code.split("\n").map((line, i) => (
          <div key={i}>
            {tokenizeLine(line).map(([text, cls], j) => (
              <span key={j} className={cls}>
                {text}
              </span>
            ))}
          </div>
        ))}
      </pre>
    </div>
  );
}

// ─── Live output panel ───────────────────────────────────────────────────────

function LiveOutput({ code }: { code: LiveCode }) {
  const isDefault = code === DEFAULT_LIVE_CODE || !code.returnLine;

  return (
    <div className="flex-1 rounded-xl bg-[#0d1117] border border-slate-700/40 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/40 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[11px] font-mono text-slate-500 tracking-wide">
            LIVE OUTPUT
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          node.js repl
        </span>
      </div>

      <pre className="flex-1 p-5 font-mono text-[13px] leading-7 overflow-y-auto">
        {isDefault ? (
          <div className="text-slate-600 italic">
            // Click any action button to see live code here
            {"\n\n"}
            <HL code={`import { AfuRewards } from "@afuchat/rewards"`} dim />
            {"\n"}
            <HL code={`const rewards = new AfuRewards()`} dim />
            {"\n\n"}
            <span className="text-slate-700">
              // Every call shows its return value{"\n"}
              // and the event it fires automatically
            </span>
          </div>
        ) : (
          <>
            <div className="text-slate-600 text-[11px] mb-1">
              {"// ─── Call " + "─".repeat(38)}
            </div>
            <div>
              <HL code={code.callLine} />
            </div>
            {code.returnLine && (
              <div className="mt-1">
                <HL code={code.returnLine} />
              </div>
            )}

            {code.eventName && (
              <>
                <div className="mt-5 text-slate-600 text-[11px] mb-1">
                  {`// ─── Event fired: ${code.eventName} ` + "─".repeat(Math.max(0, 30 - code.eventName.length))}
                </div>
                <div>
                  <HL
                    code={`rewards.on("${code.eventName}", (payload) => {`}
                  />
                </div>
                <div className="pl-4 text-slate-500 text-[12px]">
                  {code.eventPayloadLines.map((l, i) => (
                    <div key={i}>
                      <HL code={`  ${l}`} />
                    </div>
                  ))}
                </div>
                <div>
                  <HL code={`})`} />
                </div>
              </>
            )}
          </>
        )}
      </pre>
    </div>
  );
}

// ─── XP progress helpers ─────────────────────────────────────────────────────

function xpForLevel(level: number) {
  return Math.pow(level - 1, 2) * 100;
}
function xpProgress(xp: number, level: number) {
  const start = xpForLevel(level);
  const end = xpForLevel(level + 1);
  return {
    end,
    pct: Math.min(100, Math.round(((xp - start) / (end - start)) * 100)),
  };
}

// ─── Playground Tab ──────────────────────────────────────────────────────────

function PlaygroundTab({
  activeUser,
  setActiveUser,
}: {
  activeUser: User;
  setActiveUser: (u: User) => void;
}) {
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
    liveCode,
  } = useRewards();

  const stats = getUserStats(activeUser);
  const leaderboard = getLeaderboard(lbType);
  const { pct, end } = xpProgress(stats.xp, stats.level);
  const unlockedIds = new Set(stats.badges.map((b) => b.id));

  return (
    <div className="flex flex-col gap-4">
      {/* User switcher */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-500 font-mono uppercase tracking-widest shrink-0">
          active user
        </span>
        <div className="flex gap-2 flex-wrap">
          {USERS.map((u) => {
            const s = getUserStats(u);
            return (
              <button
                key={u}
                onClick={() => setActiveUser(u)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                  activeUser === u
                    ? "bg-violet-600/20 border-violet-500/50 text-violet-200"
                    : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600",
                )}
              >
                <span>{USER_AVATARS[u]}</span>
                <span className="capitalize font-mono text-[12px]">{u}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-mono",
                    activeUser === u
                      ? "bg-violet-500/20 text-violet-300"
                      : "bg-slate-700/60 text-slate-500",
                  )}
                >
                  lv {s.level}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-[380px_1fr] gap-4 min-h-0">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                {activeUser}.stats
              </span>
              <span className="text-[11px] font-mono text-violet-400">
                Level {stats.level}
              </span>
            </div>

            {/* XP bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[12px] font-mono">
                <span className="text-slate-400">xp</span>
                <span className="text-slate-400">
                  {stats.xp} / {end}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                {pct}% to level {stats.level + 1}
              </div>
            </div>

            {/* Points + streak inline */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <div className="text-[11px] text-slate-500 font-mono mb-1">
                  points
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {stats.points}
                </div>
              </div>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <div className="text-[11px] text-slate-500 font-mono mb-1">
                  streak
                </div>
                <div className="text-xl font-bold font-mono text-orange-400">
                  {stats.streak.current}
                  <span className="text-sm text-slate-500"> days</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div>
              <div className="text-[11px] text-slate-500 font-mono mb-2">
                badges ({stats.badges.length})
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-6">
                {stats.badges.length === 0 && (
                  <span className="text-[11px] text-slate-700 font-mono italic">
                    none yet
                  </span>
                )}
                {stats.badges.map((b) => (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono"
                  >
                    {b.icon} {b.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 p-4 space-y-4">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
              actions
            </span>

            {/* XP */}
            <div>
              <div className="text-[11px] font-mono text-slate-600 mb-2">
                <span className="text-blue-300">addXP</span>(userId, amount)
              </div>
              <div className="flex gap-1.5">
                {[10, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => addXP(activeUser, amt)}
                    className="flex-1 py-2 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-300 text-[12px] font-mono font-semibold hover:bg-violet-600/30 hover:border-violet-400/40 transition-colors active:scale-95"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Points */}
            <div>
              <div className="text-[11px] font-mono text-slate-600 mb-2">
                <span className="text-blue-300">addPoints</span> /{" "}
                <span className="text-blue-300">deductPoints</span>(userId, n)
              </div>
              <div className="flex gap-1.5">
                {[10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => addPoints(activeUser, amt)}
                    className="flex-1 py-2 rounded-lg bg-emerald-600/15 border border-emerald-500/25 text-emerald-300 text-[12px] font-mono font-semibold hover:bg-emerald-600/25 transition-colors active:scale-95"
                  >
                    +{amt}
                  </button>
                ))}
                <button
                  onClick={() => deductPoints(activeUser, 10)}
                  className="flex-1 py-2 rounded-lg bg-red-600/10 border border-red-500/25 text-red-400 text-[12px] font-mono font-semibold hover:bg-red-600/20 transition-colors active:scale-95"
                >
                  −10
                </button>
              </div>
            </div>

            {/* Streak */}
            <div>
              <div className="text-[11px] font-mono text-slate-600 mb-2">
                <span className="text-blue-300">updateStreak</span>(userId)
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => updateStreak(activeUser)}
                  className="flex-1 py-2 rounded-lg bg-orange-600/15 border border-orange-500/25 text-orange-300 text-[12px] font-mono font-semibold hover:bg-orange-600/25 transition-colors active:scale-95"
                >
                  Check in today
                </button>
                <button
                  onClick={() => resetStreak(activeUser)}
                  className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-slate-500 text-[12px] font-mono hover:text-slate-300 transition-colors active:scale-95"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Badges */}
            <div>
              <div className="text-[11px] font-mono text-slate-600 mb-2">
                <span className="text-blue-300">unlockBadge</span>(userId,
                badgeId) →{" "}
                <span className="text-yellow-200">Badge</span> |{" "}
                <span className="text-orange-400">null</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {BADGE_IDS.map((id) => {
                  const meta = BADGE_META[id];
                  const owned = unlockedIds.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => unlockBadge(activeUser, id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-2 rounded-lg text-[11px] border transition-colors font-mono active:scale-95",
                        owned
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400 cursor-default"
                          : "bg-slate-800/60 border-slate-700/40 text-slate-500 hover:border-amber-500/30 hover:text-amber-300",
                      )}
                    >
                      <span className="text-sm">{meta.icon}</span>
                      <span className="truncate">{meta.name}</span>
                      {owned && (
                        <span className="ml-auto text-[10px] text-amber-600">
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
          <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                leaderboard
              </span>
              <div className="flex rounded-lg overflow-hidden border border-slate-700/50 text-[11px] font-mono">
                {(["xp", "points"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLbType(t)}
                    className={cn(
                      "px-3 py-1 transition-colors",
                      lbType === t
                        ? "bg-violet-600/30 text-violet-300"
                        : "bg-transparent text-slate-500 hover:text-slate-300",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5 font-mono text-[12px]">
              {leaderboard.map((entry) => {
                const medals = ["🥇", "🥈", "🥉"];
                const valColors = [
                  "text-amber-400",
                  "text-slate-300",
                  "text-orange-600",
                ];
                const isActive = entry.userId === activeUser;
                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border",
                      isActive
                        ? "bg-violet-600/10 border-violet-500/25"
                        : "bg-slate-800/40 border-slate-700/30",
                    )}
                  >
                    <span className="w-5 text-center">
                      {medals[entry.rank - 1] ?? `#${entry.rank}`}
                    </span>
                    <span className="text-base">
                      {USER_AVATARS[entry.userId as User] ?? "🙂"}
                    </span>
                    <span className="flex-1 capitalize text-slate-300">
                      {entry.userId}
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        valColors[entry.rank - 1] ?? "text-slate-500",
                      )}
                    >
                      {entry.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Live output + event log */}
        <div className="flex flex-col gap-4 min-h-0">
          <LiveOutput code={liveCode} />

          {/* Event log */}
          <div className="rounded-xl bg-[#0d1117] border border-slate-700/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/40 bg-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono text-slate-500 tracking-wide">
                  EVENT LOG
                </span>
                <span className="text-[10px] font-mono text-slate-600 ml-1">
                  — via <span className="text-slate-500">rewards.on(event, handler)</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono">
                {log.length} events
              </span>
            </div>
            <div className="h-48 overflow-y-auto p-3 font-mono text-[12px] space-y-1">
              {log.length === 0 ? (
                <div className="text-slate-700 italic pt-1">
                  // events appear here as you interact...
                </div>
              ) : (
                log.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-baseline gap-3 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <span className="text-slate-700 shrink-0 w-28">
                      {entry.ts}
                    </span>
                    <span className={cn("shrink-0 w-36 font-semibold", entry.color)}>
                      {entry.event}
                    </span>
                    <span className="text-slate-400">{entry.payload}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quickstart Tab ──────────────────────────────────────────────────────────

function QuickstartTab() {
  return (
    <div className="max-w-3xl space-y-8">
      <Step n={1} title="Install">
        <div className="flex items-center gap-3">
          <code className="flex-1 font-mono text-sm bg-[#0d1117] border border-slate-700/50 rounded-lg px-4 py-3 text-emerald-300">
            npm install @afuchat/rewards
          </code>
          <CopyBtn text="npm install @afuchat/rewards" className="shrink-0 text-sm px-3 py-2" />
        </div>
        <p className="text-[12px] text-slate-500 font-mono mt-2">
          Zero dependencies · TypeScript · ESM + CJS · Node.js ≥ 18
        </p>
      </Step>

      <Step n={2} title="Create an instance">
        <CodeBlock
          code={`import { AfuRewards } from "@afuchat/rewards"

const rewards = new AfuRewards()
// Optional: custom level formula
const rewards2 = new AfuRewards({
  level: { formula: (xp) => Math.floor(xp / 200) + 1 }
})`}
        />
      </Step>

      <Step n={3} title="Register badges">
        <CodeBlock
          code={`rewards.defineBadge("welcome", {
  name: "Welcome",
  description: "Joined the platform",
  icon: "👋",
})

rewards.defineBadge("centurion", {
  name: "Centurion",
  description: "Reached 100 XP",
  icon: "💯",
})`}
        />
      </Step>

      <Step n={4} title="Give users XP, points, and badges">
        <CodeBlock
          code={`// XP auto-levels the user (configurable formula)
rewards.addXP("user_123", 250)
rewards.getXP("user_123")        // → 250
rewards.getLevel("user_123")     // → 2

// Spendable points (separate from XP)
rewards.addPoints("user_123", 50)
rewards.deductPoints("user_123", 10)
rewards.getPoints("user_123")    // → 40

// Badges: returns the Badge or null if already owned
const badge = rewards.unlockBadge("user_123", "centurion")
badge?.name                      // → "Centurion"
rewards.getBadges("user_123")    // → [{ id, name, icon, unlockedAt }]`}
        />
      </Step>

      <Step n={5} title="Daily streaks">
        <CodeBlock
          code={`// Idempotent — safe to call multiple times per day
rewards.updateStreak("user_123")

rewards.getStreak("user_123")
// → { current: 1, longest: 1, lastUpdated: "2025-06-01" }

// Reset on missed day
rewards.resetStreak("user_123")`}
        />
      </Step>

      <Step n={6} title="Listen to events">
        <CodeBlock
          code={`// All SDK events fire automatically
rewards.on("xp_added", ({ userId, amount, total }) => {
  console.log(\`\${userId} earned \${amount} XP (total: \${total})\`)
})

rewards.on("badge_unlocked", ({ userId, badge }) => {
  console.log(\`\${userId} unlocked "\${badge.name}"!\`)
})

// Available events:
// xp_added · points_added · points_deducted
// badge_unlocked · streak_updated · streak_reset

// Custom events
rewards.on("user_posted", ({ id }: { id: string }) => {
  rewards.addXP(id, 10)
  rewards.addPoints(id, 5)
})
rewards.emit("user_posted", { id: "user_123" })

// Unsubscribe
rewards.off("xp_added", myHandler)`}
        />
      </Step>

      <Step n={7} title="Leaderboards">
        <CodeBlock
          code={`// Sorted by XP or points, with rank
const top = rewards.getLeaderboard("xp")
// → [
//     { rank: 1, userId: "user_123", value: 250 },
//     { rank: 2, userId: "user_456", value: 180 },
//   ]

const byPoints = rewards.getLeaderboard("points")`}
        />
      </Step>

      <Step n={8} title="Persistence (Node.js only)">
        <CodeBlock
          code={`// Save state to disk
await rewards.persist("./rewards-state.json")

// Restore on process restart
await rewards.restore("./rewards-state.json")

// Or use in-memory snapshots (browser-safe)
const snap = rewards.snapshot()
// ... later
rewards.loadSnapshot(snap)`}
        />
      </Step>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-[12px] font-bold font-mono text-violet-400">
          {n}
        </div>
        <div className="flex-1 w-px bg-slate-800" />
      </div>
      <div className="flex-1 pb-2 space-y-2">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ─── API Reference Tab ───────────────────────────────────────────────────────

interface MethodDoc {
  sig: string;
  returns: string;
  desc: string;
  example?: string;
  event?: string;
}

const API_GROUPS: Array<{ label: string; color: string; methods: MethodDoc[] }> = [
  {
    label: "XP",
    color: "violet",
    methods: [
      {
        sig: "addXP(userId: string, amount: number)",
        returns: "number",
        desc: "Add XP to a user. Auto-creates the user record if it doesn't exist.",
        example: `rewards.addXP("u1", 100) // → 100 (total XP)`,
        event: "xp_added → { userId, amount, total }",
      },
      {
        sig: "getXP(userId: string)",
        returns: "number",
        desc: "Get the total XP for a user.",
        example: `rewards.getXP("u1") // → 100`,
      },
      {
        sig: "getLevel(userId: string)",
        returns: "number",
        desc: "Get the current level. Default formula: floor(sqrt(xp/100)) + 1.",
        example: `rewards.getLevel("u1") // → 2`,
      },
    ],
  },
  {
    label: "Points",
    color: "emerald",
    methods: [
      {
        sig: "addPoints(userId: string, amount: number)",
        returns: "number",
        desc: "Add spendable points (separate from XP).",
        example: `rewards.addPoints("u1", 50) // → 50`,
        event: "points_added → { userId, amount, total }",
      },
      {
        sig: "deductPoints(userId: string, amount: number)",
        returns: "number",
        desc: "Deduct points. Floors at 0, never negative.",
        example: `rewards.deductPoints("u1", 10) // → 40`,
        event: "points_deducted → { userId, amount, total }",
      },
      {
        sig: "getPoints(userId: string)",
        returns: "number",
        desc: "Get current points balance.",
      },
    ],
  },
  {
    label: "Badges",
    color: "amber",
    methods: [
      {
        sig: "defineBadge(id: string, def: BadgeDefinition)",
        returns: "void",
        desc: "Register a badge. Must be called before unlockBadge.",
        example: `rewards.defineBadge("welcome", { name: "Welcome", icon: "👋" })`,
      },
      {
        sig: "unlockBadge(userId: string, badgeId: string)",
        returns: "Badge | null",
        desc: "Unlock a badge. Returns the Badge object, or null if already owned.",
        example: `const b = rewards.unlockBadge("u1", "welcome")\n// → Badge | null`,
        event: "badge_unlocked → { userId, badge }",
      },
      {
        sig: "getBadges(userId: string)",
        returns: "Badge[]",
        desc: "Get all badges owned by a user.",
      },
    ],
  },
  {
    label: "Streaks",
    color: "orange",
    methods: [
      {
        sig: "updateStreak(userId: string)",
        returns: "StreakRecord",
        desc: "Record a check-in for today. Idempotent — safe to call multiple times per day.",
        example: `rewards.updateStreak("u1")\n// → { current: 1, longest: 1 }`,
        event: "streak_updated → { userId, streak }",
      },
      {
        sig: "resetStreak(userId: string)",
        returns: "void",
        desc: "Reset the current streak to 0 (longest is preserved).",
        event: "streak_reset → { userId }",
      },
      {
        sig: "getStreak(userId: string)",
        returns: "StreakRecord",
        desc: "Get streak info: { current, longest, lastUpdated }.",
      },
    ],
  },
  {
    label: "Leaderboard",
    color: "sky",
    methods: [
      {
        sig: 'getLeaderboard(type: "xp" | "points")',
        returns: "LeaderboardEntry[]",
        desc: "Returns all users sorted by rank.",
        example: `rewards.getLeaderboard("xp")\n// → [{ rank, userId, value }, ...]`,
      },
    ],
  },
  {
    label: "Events",
    color: "pink",
    methods: [
      {
        sig: "on(event: string, handler: Function)",
        returns: "void",
        desc: "Subscribe to an SDK or custom event.",
        example: `rewards.on("xp_added", ({ userId, total }) => { ... })`,
      },
      {
        sig: "off(event: string, handler: Function)",
        returns: "void",
        desc: "Unsubscribe a handler.",
      },
      {
        sig: "emit(event: string, payload: unknown)",
        returns: "void",
        desc: "Fire a custom event. Useful for triggering reward logic from app events.",
        example: `rewards.emit("user_posted", { id: "u1" })`,
      },
    ],
  },
  {
    label: "Persistence",
    color: "slate",
    methods: [
      {
        sig: "snapshot()",
        returns: "SerializedStore",
        desc: "Export current state as a plain object. Browser-safe.",
      },
      {
        sig: "loadSnapshot(snap: SerializedStore)",
        returns: "void",
        desc: "Restore state from a snapshot object.",
      },
      {
        sig: "persist(filePath: string)",
        returns: "Promise<void>",
        desc: "Write state to disk as JSON. Node.js only.",
        example: `await rewards.persist("./state.json")`,
      },
      {
        sig: "restore(filePath: string)",
        returns: "Promise<void>",
        desc: "Load state from a JSON file. Node.js only.",
        example: `await rewards.restore("./state.json")`,
      },
    ],
  },
];

const colorMap: Record<string, string> = {
  violet: "border-violet-500/30 text-violet-300 bg-violet-500/10",
  emerald: "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
  amber: "border-amber-500/30 text-amber-300 bg-amber-500/10",
  orange: "border-orange-500/30 text-orange-300 bg-orange-500/10",
  sky: "border-sky-500/30 text-sky-300 bg-sky-500/10",
  pink: "border-pink-500/30 text-pink-300 bg-pink-500/10",
  slate: "border-slate-500/30 text-slate-300 bg-slate-500/10",
};

function ApiRefTab() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/40 text-[13px] text-slate-400 font-mono">
        <span className="text-violet-400 shrink-0">!</span>
        <span>
          All methods auto-create user records on first access — no explicit{" "}
          <span className="text-slate-300">createUser()</span> call needed.
          Constructor: <span className="text-yellow-200">new AfuRewards</span>
          (<span className="text-sky-300">config?</span>:{" "}
          <span className="text-yellow-200">AfuRewardsConfig</span>)
        </span>
      </div>

      {API_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-4">
            <span
              className={cn(
                "text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border",
                colorMap[group.color],
              )}
            >
              {group.label}
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
          <div className="space-y-3">
            {group.methods.map((m) => (
              <div
                key={m.sig}
                className="rounded-xl bg-slate-900/60 border border-slate-700/40 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-slate-700/30 bg-slate-800/30">
                  <code className="text-[13px] font-mono text-slate-200 leading-relaxed">
                    <span className="text-blue-300">
                      {m.sig.split("(")[0]}
                    </span>
                    <span className="text-slate-400">
                      ({m.sig.split("(")[1]}
                    </span>
                  </code>
                  <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-700/60 border border-slate-600/40 text-slate-400">
                    → {m.returns}
                  </span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <p className="text-[13px] text-slate-400">{m.desc}</p>
                  {m.event && (
                    <p className="text-[11px] font-mono text-slate-600">
                      <span className="text-emerald-600">fires:</span>{" "}
                      <span className="text-emerald-500/70">{m.event}</span>
                    </p>
                  )}
                  {m.example && (
                    <pre className="mt-2 text-[12px] font-mono bg-[#0d1117] rounded-lg p-3 border border-slate-700/30 text-slate-400 overflow-x-auto">
                      {m.example.split("\n").map((line, i) => (
                        <div key={i}>
                          {tokenizeLine(line).map(([text, cls], j) => (
                            <span key={j} className={cls}>
                              {text}
                            </span>
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeUser, setActiveUser] = useState<User>("alice");
  const [tab, setTab] = useState<Tab>("playground");

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center justify-between bg-slate-900/60 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="font-mono font-bold text-slate-100">
              @afuchat/rewards
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <nav className="flex gap-1">
            {(
              [
                ["playground", "Playground"],
                ["quickstart", "Quickstart"],
                ["api", "API Reference"],
              ] as const
            ).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
                  tab === t
                    ? "bg-slate-700/80 text-slate-100"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/60",
                )}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-400">
            <span className="text-slate-600">$</span>
            <span>npm install @afuchat/rewards</span>
            <CopyBtn text="npm install @afuchat/rewards" className="ml-1" />
          </div>
          <span className="text-[11px] font-mono bg-violet-500/15 text-violet-300 border border-violet-500/25 px-2 py-1 rounded">
            v1.0.0
          </span>
          <span className="text-[11px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-1 rounded">
            0 deps
          </span>
          <span className="text-[11px] font-mono bg-blue-500/15 text-blue-300 border border-blue-500/25 px-2 py-1 rounded">
            TypeScript
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-5 max-w-[1400px] mx-auto w-full">
        {tab === "playground" && (
          <PlaygroundTab activeUser={activeUser} setActiveUser={setActiveUser} />
        )}
        {tab === "quickstart" && <QuickstartTab />}
        {tab === "api" && <ApiRefTab />}
      </main>
    </div>
  );
}
