"use client";

import { useMemo } from "react";
import { BadgeCheck, Trophy, Star } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const levels = [
  {
    name: "Hobbyist",
    xpRequired: 0,
    perks: [
      "Access to basic raffles",
      "Standard support",
      "Monthly drop digest",
    ],
  },
  {
    name: "Enthusiast",
    xpRequired: 1000,
    perks: [
      "Access to exclusive raffles",
      "Priority waitlist",
      "Early access to events",
    ],
  },
  {
    name: "Sneakerhead",
    xpRequired: 5000,
    perks: [
      "Access to all raffles",
      "VIP event access",
      "Concierge support",
      "Private events",
    ],
  },
];

const badges = [
  {
    id: "badge-1",
    label: "Drop Hunter",
    description: "Bought within 5 minutes of launch",
    status: "Unlocked",
  },
  {
    id: "badge-3",
    label: "Sustainability Ally",
    description: "Picked eco shipping 10 times",
    status: "Locked",
  },
  {
    id: "badge-4",
    label: "Wishlist Guru",
    description: "Maintained 3 active lists",
    status: "Unlocked",
  },
];

function ProgressBar({ value, goal }: { value: number; goal: number }) {
  const ratio = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div className="h-3 bg-background border-2 border-border overflow-hidden">
      <div
        className="h-full bg-green-500 transition-all"
        style={{ width: `${ratio}%` }}
      />
    </div>
  );
}

const statusColors: Record<string, string> = {
  Unlocked: "text-success bg-success/10 border-success",
  Pending: "text-warning bg-warning/10 border-warning",
  Locked: "text-muted-foreground bg-muted/10 border-border",
};

export default function ProgressPage() {
  const { user } = useAuth();

  const playerName = useMemo(
    () => user?.email?.split("@")[0] ?? "Explorer",
    [user?.email]
  );

  const currentXP = user?.xp ?? 0;
  const currentLevel = useMemo(() => {
    const userLevel = user?.level ?? "Hobbyist";
    return levels.find((l) => l.name === userLevel) ?? levels[0];
  }, [user?.level]);

  const nextLevel = useMemo(() => {
    const currentIndex = levels.findIndex((l) => l.name === currentLevel.name);
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    return null;
  }, [currentLevel]);

  const xpProgress = nextLevel ? currentXP - currentLevel.xpRequired : 0;
  const xpNeeded = nextLevel
    ? nextLevel.xpRequired - currentLevel.xpRequired
    : 0;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 space-y-16">
        <header className="bg-background py-10 md:py-12">
          <div className="flex flex-col gap-6 w-full border border-border bg-background p-6 md:p-8">
            <div>
              <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-4">
                Current Level
              </p>
              <div className="space-y-3">
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter text-foreground">
                  {currentLevel.name}
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground">
                    {currentXP.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground font-mono mb-2 text-xl md:text-2xl">
                    XP
                  </span>
                </div>
              </div>
            </div>
            {nextLevel && (
              <div className="space-y-3 pt-6 border-t border-border">
                <div className="flex items-center justify-between text-sm font-mono uppercase tracking-widest">
                  <span className="text-muted-foreground">
                    Next: {nextLevel.name}
                  </span>
                  <span className="text-foreground font-semibold">
                    {xpProgress}/{xpNeeded}
                  </span>
                </div>
                <ProgressBar value={xpProgress} goal={xpNeeded} />
              </div>
            )}
            {!nextLevel && (
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground pt-6 border-t border-border">
                Maximum level reached
              </p>
            )}
          </div>
        </header>

        <section className="space-y-12">
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-border pb-4">
              <Trophy className="h-6 w-6 text-warning" aria-hidden />
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-foreground">
                Levels & Perks
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {levels.map((level, index) => {
                const isCurrent = level.name === currentLevel.name;
                const isUnlocked = currentXP >= level.xpRequired;
                return (
                  <div
                    key={level.name}
                    className={`border-2 p-6 space-y-4 transition-all ${
                      isCurrent
                        ? "border-foreground bg-background"
                        : isUnlocked
                        ? "border-border bg-background"
                        : "border-border bg-muted/10 opacity-60"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold uppercase tracking-tight text-foreground">
                          {level.name}
                        </h3>
                        {isCurrent && (
                          <span className="text-xs uppercase font-mono font-bold text-info border border-info px-2 py-1">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                        {level.xpRequired.toLocaleString()} XP Required
                      </p>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-border">
                      <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                        Perks
                      </p>
                      <ul className="space-y-2">
                        {level.perks.map((perk, perkIndex) => (
                          <li
                            key={perkIndex}
                            className="text-sm text-foreground font-mono uppercase tracking-wider flex items-start gap-2"
                          >
                            <span className="text-info mt-1">•</span>
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-border pb-4">
              <Star className="h-6 w-6 text-info" aria-hidden />
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-foreground">
                Badges
              </h2>
            </div>
            <div className="grid gap-px bg-border border border-border">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start justify-between border border-border bg-background p-4 hover:border-info transition-colors"
                >
                  <div>
                    <p className="font-bold uppercase text-foreground">
                      {badge.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {badge.description}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold uppercase tracking-widest border px-3 py-1 ${
                      statusColors[badge.status]
                    }`}
                  >
                    {badge.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
