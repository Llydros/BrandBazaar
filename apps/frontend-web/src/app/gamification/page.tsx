"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Gift,
  Medal,
  Star,
  Ticket,
  Trophy,
  Crown,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

const missions = [
  {
    id: "mission-1",
    title: "Complete 3 verified purchases",
    detail: "Earn priority shipping tokens for every authenticated order.",
    progress: 2,
    goal: 3,
    reward: "+450 XP • +1 express token",
  },
  {
    id: "mission-2",
    title: "Share wishlist to unlock VIP queue",
    detail: "Invite a friend and keep your wishlist synced across devices.",
    progress: 1,
    goal: 1,
    reward: "+300 XP • VIP waitlist access",
  },
  {
    id: "mission-3",
    title: "Log in streak",
    detail: "Stay active for 7 consecutive days to boost loyalty multipliers.",
    progress: 5,
    goal: 7,
    reward: "+150 XP • +5% loyalty boost",
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
    id: "badge-2",
    label: "Community Curator",
    description: "Submitted 5 approved Q&A answers",
    status: "In progress",
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

const vipTiers = [
  {
    id: "vip-1",
    tier: "Silver",
    requirement: "0 - 1,999 XP",
    perks: ["Standard support", "Monthly drop digest"],
    active: false,
  },
  {
    id: "vip-2",
    tier: "Gold",
    requirement: "2,000 - 4,999 XP",
    perks: ["Priority waitlist", "Dedicated stylist ping"],
    active: true,
  },
  {
    id: "vip-3",
    tier: "Platinum",
    requirement: "5,000+ XP",
    perks: ["48h early access", "Concierge checkout", "Private events"],
    active: false,
  },
];

const loyaltyPerks = [
  {
    label: "Cashback multiplier",
    value: "1.4x",
    description: "Applies to sneaker category purchases",
  },
  {
    label: "Return window",
    value: "30 days",
    description: "Extended for all verified VIP orders",
  },
  {
    label: "Drop notifications",
    value: "Ultra-fast",
    description: "Delivered via push + SMS + e-mail simultaneously",
  },
];

const eventPriority = [
  {
    id: "event-1",
    name: "BrandBazaar Secret Vault",
    date: "Feb 12, 2026",
    benefit: "Guaranteed slot + plus-one",
    requirement: "Gold VIP • 3 wishlist purchases",
  },
  {
    id: "event-2",
    name: "Collector Summit Istanbul",
    date: "Mar 8, 2026",
    benefit: "Front-row workshop seats",
    requirement: "Platinum waitlist",
  },
];

const statusColors: Record<string, string> = {
  Unlocked: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800",
  "In progress": "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800",
  Locked: "text-gray-500 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700",
};

function ProgressBar({ value, goal }: { value: number; goal: number }) {
  const ratio = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
        style={{ width: `${ratio}%` }}
      />
    </div>
  );
}

export default function GamificationPage() {
  const { user } = useAuth();

  const playerName = useMemo(() => user?.email?.split("@")[0] ?? "Explorer", [user?.email]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <Link href="/products" className="hover:text-white underline underline-offset-4">
            Back to catalog
          </Link>
        </div>

        <header className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-8 text-white shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide font-semibold">
            <BadgeCheck className="h-5 w-5" aria-hidden />
            Connected loyalty identity
          </div>
          <div className="flex flex-wrap justify-between gap-6">
            <div>
              <p className="text-sm text-white/80">Gamification Hub</p>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">Hey {playerName}, let’s level you up.</h1>
              <p className="mt-3 text-white/80 max-w-xl">
                Track progress, unlock VIP badges, and reserve event tickets based on your BrandBazaar footprint. Every
                purchase, wishlist action, and legit check boosts your standing.
              </p>
            </div>
            <div className="flex flex-col gap-3 bg-white/10 rounded-2xl border border-white/30 px-6 py-5 min-w-[220px]">
              <p className="text-sm uppercase tracking-wide text-white/70">Current season</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold">3,420</span>
                <span className="text-white/70 font-medium mb-1">XP</span>
              </div>
              <p className="text-sm text-white/80">Next reward in 580 XP</p>
              <ProgressBar value={3420 - 3000} goal={1000} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Sparkles className="h-4 w-4" aria-hidden />
              Loyalty multiplier 1.4x
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Trophy className="h-4 w-4" aria-hidden />
              Ranked #128 this quarter
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Ticket className="h-4 w-4" aria-hidden />
              2 event boosts remaining
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Medal className="h-4 w-4 text-amber-400" aria-hidden />
              Missions
            </div>
            <div className="space-y-5">
              {missions.map((mission) => (
                <div key={mission.id} className="rounded-xl bg-slate-900/60 border border-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{mission.title}</h3>
                      <p className="text-sm text-slate-300">{mission.detail}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg">
                      {mission.progress}/{mission.goal}
                    </span>
                  </div>
                  <ProgressBar value={mission.progress} goal={mission.goal} />
                  <p className="text-xs text-slate-400">{mission.reward}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white text-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wide">
              <Star className="h-4 w-4 text-indigo-500" aria-hidden />
              Badge system
            </div>
            <div className="grid gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start justify-between rounded-xl border border-slate-100 p-4 bg-slate-50 hover:border-indigo-200 transition"
                >
                  <div>
                    <p className="font-semibold">{badge.label}</p>
                    <p className="text-sm text-slate-500">{badge.description}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide border px-3 py-1 rounded-full ${statusColors[badge.status]}`}
                  >
                    {badge.status}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full">
              View all badges
            </Button>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-black border border-white/10 p-6 space-y-6">
            <div className="flex items-center gap-2 text-sm text-slate-300 uppercase tracking-wide">
              <Crown className="h-4 w-4 text-yellow-400" aria-hidden />
              VIP Üye sistemi
            </div>
            <div className="space-y-4">
              {vipTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-2xl border p-4 space-y-2 ${tier.active ? "border-yellow-300 bg-yellow-300/10" : "border-white/10 bg-white/5"}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">{tier.tier}</p>
                    {tier.active && (
                      <span className="text-xs uppercase font-semibold text-yellow-300">Active</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300">{tier.requirement}</p>
                  <ul className="text-sm text-slate-200 space-y-1">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-300" aria-hidden />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="bg-white/10 text-white border border-white/20 hover:bg-white/20">
              Upgrade plan
            </Button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white text-slate-900 p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-pink-500" aria-hidden />
              <h2 className="text-xl font-semibold">Loyalty stack</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {loyaltyPerks.map((perk) => (
                <div key={perk.label} className="rounded-2xl border border-slate-100 p-4 bg-slate-50 space-y-2">
                  <p className="text-xs uppercase font-semibold text-slate-500">{perk.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{perk.value}</p>
                  <p className="text-sm text-slate-500">{perk.description}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 flex flex-col gap-3">
              <p className="text-sm text-slate-500">
                Coming soon: automatic cart boosts + legit-check multipliers when this page connects to orders and
                purchases.
              </p>
              <Button variant="secondary" asChild>
                <Link href="/dashboard" prefetch={false}>
                  View wallet summary
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-white/10 p-6 space-y-6 text-white">
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-cyan-300" aria-hidden />
              <h2 className="text-xl font-semibold">User priorities & event ticket dağıtımı</h2>
            </div>
            <p className="text-sm text-white/70">
              Your VIP level defines queue position for drops, raffles, and live events. Keep missions active to climb the
              list before the upcoming releases.
            </p>
            <div className="space-y-4">
              {eventPriority.map((event) => (
                <div key={event.id} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{event.name}</p>
                    <span className="text-xs uppercase tracking-wide text-white/70">{event.date}</span>
                  </div>
                  <p className="text-sm text-white/80">{event.benefit}</p>
                  <p className="text-xs text-white/60">Requirement: {event.requirement}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/events" prefetch={false}>
                  Explore events & raffles
                </Link>
              </Button>
              <Button className="bg-cyan-500 text-slate-900 hover:bg-cyan-400" asChild>
                <Link href="/wishlist" prefetch={false}>
                  Boost priority via wishlist
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


