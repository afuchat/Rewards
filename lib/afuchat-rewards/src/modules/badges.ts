import type { Badge } from "../types.js";
import type { MemoryStore } from "../storage/memory-store.js";

export interface BadgeDefinition {
  name: string;
  description: string;
  icon?: string;
}

export class BadgesModule {
  private definitions = new Map<string, BadgeDefinition>();

  constructor(private store: MemoryStore) {}

  defineBadge(id: string, definition: BadgeDefinition): void {
    this.definitions.set(id, definition);
  }

  unlockBadge(userId: string, badgeId: string): Badge | null {
    const user = this.store.getOrCreate(userId);
    const alreadyUnlocked = user.badges.some((b) => b.id === badgeId);
    if (alreadyUnlocked) return null;

    const def = this.definitions.get(badgeId) ?? {
      name: badgeId,
      description: "",
    };

    const badge: Badge = {
      id: badgeId,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlockedAt: new Date(),
    };

    user.badges.push(badge);
    return badge;
  }

  getBadges(userId: string): Badge[] {
    return [...this.store.getOrCreate(userId).badges];
  }

  hasBadge(userId: string, badgeId: string): boolean {
    return this.store.getOrCreate(userId).badges.some((b) => b.id === badgeId);
  }
}
