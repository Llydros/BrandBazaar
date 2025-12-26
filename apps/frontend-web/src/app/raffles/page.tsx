"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarHeart,
  CheckCircle2,
  Flame,
  MapPin,
  Sparkles,
  Ticket,
  Users,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Raffle } from "@shared/raffles";
import { getImageUrl } from "@/lib/utils";
import { Lock } from "lucide-react";

function toMs(dateLike: string | undefined) {
  if (!dateLike) return null;
  const ms = Date.parse(dateLike);
  return Number.isFinite(ms) ? ms : null;
}

function isPreviousHybrid(
  status: string | undefined,
  dateIso: string | undefined
) {
  if (status === "ended") return true;
  const ms = toMs(dateIso);
  if (ms === null) return false;
  return ms < Date.now();
}

function OnboardingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      title: "Join Raffles",
      description:
        "Enter raffles for a chance to purchase exclusive sneakers and attend events",
    },
    {
      title: "Earn XP",
      description: "The more you participate, the more you earn",
    },
    {
      title: "Level Up",
      description: "Progress through levels, Unlock new opportunities",
    },
    {
      title: "Unlock Exclusive Events",
      description: "Access to exclusive, level-gated events and raffles",
    },
  ];

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
    localStorage.setItem("events-onboarding-dismissed", "true");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="!max-w-[60vw] sm:!max-w-[60vw] !w-[60vw] h-[80vh] m-0 p-0 rounded-none border-2 border-border bg-background"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full p-8 md:p-16">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                bazaarexclusive
              </p>
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">
                How It Works
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-3 hover:bg-secondary transition-colors border border-border"
              aria-label="Close onboarding"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-3xl space-y-8 text-left">
              <div
                key={currentStep}
                className="space-y-6 animate-in fade-in-0 duration-500 flex"
              >
                <div className="flex">
                  <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-foreground bg-foreground text-background flex items-center justify-center font-bold text-4xl md:text-5xl">
                    {currentStep + 1}
                  </div>
                </div>
                <div className="space-y-4 ml-8">
                  <h3 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">
                    {currentStepData.title}
                  </h3>
                  <p className="text-xl md:text-2xl text-muted-foreground font-mono uppercase tracking-wider max-w-2xl mx-auto">
                    {currentStepData.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-border">
            <Button
              onClick={handlePrev}
              variant="outline"
              className="rounded-none uppercase tracking-wider px-6 py-3"
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 transition-all ${
                    index === currentStep
                      ? "bg-foreground w-8"
                      : "bg-muted-foreground"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="rounded-none uppercase tracking-wider px-6 py-3"
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              {currentStep < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const levels = [
  { name: "Hobbyist", xpRequired: 0 },
  { name: "Enthusiast", xpRequired: 1000 },
  { name: "Sneakerhead", xpRequired: 5000 },
];

export default function RafflesPage() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "previous">(
    "upcoming"
  );
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myEntries, setMyEntries] = useState<any[]>([]);
  const [activeRaffle, setActiveRaffle] = useState<Raffle | null>(null);
  const [activeEvent, setActiveEvent] = useState<Raffle | null>(null);
  const [raffleModalId, setRaffleModalId] = useState<string | null>(null);
  const [eventModalId, setEventModalId] = useState<string | null>(null);

  const currentXP = user?.xp ?? 0;
  const currentLevel = user?.level ?? "Hobbyist";
  const nextLevel = useMemo(() => {
    const currentIndex = levels.findIndex((l) => l.name === currentLevel);
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    return null;
  }, [currentLevel]);

  const xpProgress = nextLevel
    ? currentXP - levels.find((l) => l.name === currentLevel)!.xpRequired
    : 0;
  const xpNeeded = nextLevel
    ? nextLevel.xpRequired -
      levels.find((l) => l.name === currentLevel)!.xpRequired
    : 0;

  useEffect(() => {
    const dismissed = localStorage.getItem("events-onboarding-dismissed");
    if (dismissed === "true") {
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    async function loadRaffles() {
      try {
        setIsLoading(true);
        const response = await api.raffles.getAll();
        setRaffles(response.raffles);
        if (user) {
          const entriesResponse = await api.raffles.getMyEntries();
          setMyEntries(entriesResponse.entries);
        }
      } catch (error) {
        console.error("Failed to load raffles", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRaffles();
  }, [user]);

  const levelOrder = {
    Hobbyist: 0,
    Enthusiast: 1,
    Sneakerhead: 2,
  };

  const canAccessRaffle = (raffle: Raffle): boolean => {
    if (!user) return false;
    const userLevelOrder = levelOrder[user.level as keyof typeof levelOrder];
    const raffleLevelOrder =
      levelOrder[raffle.requiredLevel as keyof typeof levelOrder];
    return userLevelOrder >= raffleLevelOrder;
  };

  const hasEnteredRaffle = (raffleId: string): boolean => {
    return myEntries.some((entry) => entry.raffleId === raffleId);
  };

  const filteredSneakerRaffles = useMemo(() => {
    const sneakerRaffles = raffles.filter((r) => r.type === "sneaker");
    const withMeta = sneakerRaffles.map((r) => ({
      ...r,
      __isPrevious: isPreviousHybrid(r.status, r.releaseDate),
      __ms: toMs(r.releaseDate) ?? Number.POSITIVE_INFINITY,
      __canAccess: canAccessRaffle(r),
      __hasEntered: hasEnteredRaffle(r.id),
    }));

    const filtered = withMeta.filter((r) =>
      timeFilter === "previous" ? r.__isPrevious : !r.__isPrevious
    );

    filtered.sort((a, b) => {
      return timeFilter === "previous" ? b.__ms - a.__ms : a.__ms - b.__ms;
    });

    return filtered;
  }, [timeFilter, raffles, user, myEntries]);

  const filteredEventRaffles = useMemo(() => {
    const eventRaffles = raffles.filter((r) => r.type === "event");
    const withMeta = eventRaffles.map((e) => ({
      ...e,
      __isPrevious: isPreviousHybrid(e.status, e.eventDate),
      __ms: toMs(e.eventDate) ?? Number.POSITIVE_INFINITY,
      __canAccess: canAccessRaffle(e),
      __hasEntered: hasEnteredRaffle(e.id),
    }));

    const filtered = withMeta.filter((e) =>
      timeFilter === "previous" ? e.__isPrevious : !e.__isPrevious
    );

    filtered.sort((a, b) => {
      return timeFilter === "previous" ? b.__ms - a.__ms : a.__ms - b.__ms;
    });

    return filtered;
  }, [timeFilter, raffles, user, myEntries]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 space-y-16">
        <header className="border border-border bg-background p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest font-bold">
            <Sparkles className="h-5 w-5" aria-hidden />
            BrandBazaar Raffles
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-[0.9] text-foreground">
              Enter Raffles. Earn XP. Level Up.
            </h1>
            <p className="text-sm uppercase tracking-wider text-muted-foreground max-w-2xl font-mono">
              Enter raffles for a chance to purchase exclusive sneakers and
              attend events. Each entry earns you XP and brings you closer to
              unlocking exclusive opportunities.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div className="flex items-center gap-2 border border-border">
              <Button
                type="button"
                variant={timeFilter === "upcoming" ? "default" : "outline"}
                className="rounded-none uppercase tracking-wider"
                onClick={() => setTimeFilter("upcoming")}
              >
                Upcoming
              </Button>
              <Button
                type="button"
                variant={timeFilter === "previous" ? "default" : "outline"}
                className="rounded-none uppercase tracking-wider"
                onClick={() => setTimeFilter("previous")}
              >
                Previous
              </Button>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
              Showing{" "}
              <span className="text-foreground font-bold">
                {timeFilter === "previous" ? "previous" : "upcoming"}
              </span>{" "}
              items
            </p>
          </div>
          {user && (
            <Link
              href="/progress"
              className="flex items-center gap-4 border border-border bg-background p-4 hover:border-foreground transition-colors cursor-pointer group"
            >
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-1">
                  Your Progress
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold uppercase tracking-tight text-foreground">
                    {currentLevel}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      {currentXP.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground font-mono">
                      XP
                    </span>
                  </div>
                </div>
                {nextLevel && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest">
                      <span className="text-muted-foreground">
                        Next: {nextLevel.name}
                      </span>
                      <span className="text-foreground">
                        {xpProgress}/{xpNeeded}
                      </span>
                    </div>
                    <div className="h-2 bg-background border border-border overflow-hidden">
                      <div
                        className="h-full bg-success transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((xpProgress / xpNeeded) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </header>

        <OnboardingDialog
          open={showOnboarding}
          onOpenChange={setShowOnboarding}
        />

        <section className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-border pb-4">
              <Flame className="h-6 w-6 text-error" aria-hidden />
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-foreground">
                {timeFilter === "previous"
                  ? "Previous Releases"
                  : "Upcoming Releases"}
              </h2>
            </div>
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="uppercase tracking-widest">
                    Loading raffles...
                  </p>
                </div>
              ) : filteredSneakerRaffles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="uppercase tracking-widest text-muted-foreground">
                    No raffles found
                  </p>
                </div>
              ) : (
                filteredSneakerRaffles.map((raffle: any) => {
                  const isEnded = raffle.__isPrevious;
                  const canAccess = raffle.__canAccess;
                  const hasEntered = raffle.__hasEntered;
                  return (
                    <div
                      key={raffle.id}
                      className={`border border-border bg-background group hover:border-foreground transition-colors h-60 flex relative ${
                        !canAccess ? "opacity-60 blur-sm" : ""
                      }`}
                    >
                      {!canAccess && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                          <Lock className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="relative w-48 flex-shrink-0 overflow-hidden bg-secondary">
                        <Image
                          src={getImageUrl(raffle.imageUrl)}
                          alt={raffle.name}
                          fill
                          className={`object-contain group-hover:scale-105 transition-transform duration-300 rotate-270 ${
                            isEnded ? "opacity-60" : ""
                          }`}
                        />
                        {isEnded && (
                          <div className="absolute top-3 left-3 border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-widest font-mono">
                            Ended
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col p-6">
                        <div className="flex-1 space-y-2">
                          <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">
                            {raffle.name}
                          </h3>
                          <p className="text-xs font-mono text-muted-foreground">
                            {raffle.releaseDate
                              ? new Date(raffle.releaseDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "TBD"}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                              Purchase Price
                            </p>
                            <p className="text-lg font-bold">
                              ${raffle.entryPrice}
                            </p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                              XP Reward
                            </p>
                            <p className="text-lg font-bold text-error">
                              +{raffle.xpReward}
                            </p>
                          </div>
                        </div>
                        <Dialog
                          open={raffleModalId === raffle.id}
                          onOpenChange={(open) =>
                            setRaffleModalId(open ? raffle.id : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full mt-4 rounded-none uppercase tracking-wider border-border hover:bg-secondary text-error"
                              disabled={!canAccess || isEnded}
                              onClick={() => {
                                setActiveRaffle(raffle);
                                setRaffleModalId(raffle.id);
                              }}
                            >
                              {!canAccess
                                ? "Locked"
                                : hasEntered
                                ? "Entered"
                                : isEnded
                                ? "View Details"
                                : "Enter Raffle"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="!max-w-[60vw] sm:!max-w-[60vw]">
                            <DialogHeader>
                              <DialogTitle className="uppercase tracking-tighter">
                                {activeRaffle?.name ?? raffle.name}
                              </DialogTitle>
                              <DialogDescription className="uppercase tracking-wider font-mono text-xs">
                                {isEnded
                                  ? "This raffle has ended."
                                  : !canAccess
                                  ? "You need a higher level to enter this raffle."
                                  : "Enter the raffle for a chance to purchase this exclusive release at the listed price."}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-px md:grid-cols-2 bg-border border border-border">
                              <div className="bg-background p-6">
                                <div className="relative h-full min-h-[400px] w-auto overflow-hidden bg-secondary">
                                  <Image
                                    src={getImageUrl(
                                      (activeRaffle ?? raffle).imageUrl
                                    )}
                                    alt={(activeRaffle ?? raffle).name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                              <div className="bg-background p-6 flex flex-col">
                                <div className="flex-1 space-y-6">
                                  <div>
                                    <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">
                                      Description
                                    </p>
                                    <p className="text-sm font-mono uppercase tracking-wider">
                                      {(activeRaffle ?? raffle).description}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">
                                      Release Date
                                    </p>
                                    <p className="text-lg font-mono uppercase tracking-wider">
                                      {(activeRaffle ?? raffle).releaseDate
                                        ? new Date(
                                            (activeRaffle ?? raffle).releaseDate
                                          ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })
                                        : "TBD"}
                                    </p>
                                  </div>
                                  <div className="border-t border-border pt-4">
                                    <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2 flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-success" />
                                      Description
                                    </p>
                                    <p className="text-sm font-mono uppercase tracking-wider leading-relaxed">
                                      {(activeRaffle ?? raffle).description}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                                    <div>
                                      <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">
                                        Purchase Price
                                      </p>
                                      <p className="text-3xl font-bold">
                                        ${(activeRaffle ?? raffle).entryPrice}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">
                                        XP Reward
                                      </p>
                                      <p className="text-3xl font-bold text-error">
                                        +{(activeRaffle ?? raffle).xpReward}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="border-t border-border pt-4 space-y-2">
                                    <p className="text-xs font-mono text-muted-foreground">
                                      Required Level:{" "}
                                      <span className="text-foreground font-bold">
                                        {(activeRaffle ?? raffle).requiredLevel}
                                      </span>
                                    </p>
                                  </div>
                                  {!user && (
                                    <div className="border border-destructive p-4">
                                      <p className="text-xs uppercase tracking-wider font-mono text-destructive">
                                        Please log in to enter raffles.
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0 pt-6 border-t border-border mt-6">
                                  <Button
                                    variant="outline"
                                    className="rounded-none uppercase tracking-wider"
                                    onClick={() => setRaffleModalId(null)}
                                  >
                                    Close
                                  </Button>
                                  <Button
                                    className="rounded-none uppercase tracking-wider"
                                    disabled={
                                      !user ||
                                      isEnded ||
                                      !canAccess ||
                                      hasEntered
                                    }
                                    onClick={async () => {
                                      if (!hasEntered && canAccess && user) {
                                        try {
                                          await api.raffles.enter(raffle.id);
                                          const entriesResponse =
                                            await api.raffles.getMyEntries();
                                          setMyEntries(entriesResponse.entries);
                                          setRaffleModalId(null);
                                        } catch (error) {
                                          alert(
                                            error instanceof Error
                                              ? error.message
                                              : "Failed to enter raffle"
                                          );
                                        }
                                      }
                                    }}
                                  >
                                    {!canAccess
                                      ? "Locked"
                                      : hasEntered
                                      ? "Already Entered"
                                      : isEnded
                                      ? "Raffle Ended"
                                      : "Enter Raffle"}
                                  </Button>
                                </DialogFooter>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-border pb-4">
              <CalendarHeart className="h-6 w-6 text-info" aria-hidden />
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-foreground">
                {timeFilter === "previous"
                  ? "Previous Events"
                  : "Exclusive Events"}
              </h2>
            </div>
            <div className="space-y-6">
              {filteredEventRaffles.map((event: any) => {
                const isEnded = event.__isPrevious;
                const canAccess = event.__canAccess;
                const hasEntered = event.__hasEntered;
                return (
                  <div
                    key={event.id}
                    className={`border border-border bg-background group hover:border-foreground transition-colors h-60 flex relative ${
                      !canAccess ? "opacity-60 blur-sm" : ""
                    }`}
                  >
                    {!canAccess && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                        <Lock className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="relative w-48 flex-shrink-0 overflow-hidden bg-secondary">
                      <Image
                        src={getImageUrl(event.imageUrl)}
                        alt={event.name}
                        fill
                        className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                          isEnded ? "opacity-60" : ""
                        }`}
                      />
                      {isEnded && (
                        <div className="absolute top-3 left-3 border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-widest font-mono">
                          Ended
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col p-6">
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">
                          {event.name}
                        </h3>
                        {event.location && (
                          <p className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-info" aria-hidden />
                            {event.location}
                          </p>
                        )}
                        <p className="text-xs font-mono text-muted-foreground">
                          {event.eventDate
                            ? new Date(event.eventDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "TBD"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                            Entry
                          </p>
                          <p className="text-lg font-bold">
                            ${event.entryPrice}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                            XP Reward
                          </p>
                          <p className="text-lg font-bold text-info">
                            +{event.xpReward}
                          </p>
                        </div>
                      </div>
                      <Dialog
                        open={eventModalId === event.id}
                        onOpenChange={(open) =>
                          setEventModalId(open ? event.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full mt-4 rounded-none uppercase tracking-wider text-info border-info hover:bg-background"
                            disabled={!canAccess || isEnded}
                            onClick={() => {
                              setActiveEvent(event);
                              setEventModalId(event.id);
                            }}
                          >
                            {!canAccess
                              ? "Locked"
                              : hasEntered
                              ? "Entered"
                              : isEnded
                              ? "View Details"
                              : "Enter Raffle"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="!max-w-[60vw] sm:!max-w-[60vw]">
                          <DialogHeader>
                            <DialogTitle className="uppercase tracking-tighter">
                              {activeEvent?.name ?? event.name}
                            </DialogTitle>
                            <DialogDescription className="uppercase tracking-wider font-mono text-xs">
                              {isEnded
                                ? "This event raffle has ended."
                                : !canAccess
                                ? "You need a higher level to enter this raffle."
                                : "Enter the raffle for a chance to attend this exclusive event."}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-px md:grid-cols-2 bg-border border border-border">
                            <div className="bg-background p-6">
                              <div className="relative aspect-video overflow-hidden bg-secondary border border-border">
                                <Image
                                  src={getImageUrl(
                                    (activeEvent ?? event).imageUrl
                                  )}
                                  alt={(activeEvent ?? event).name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div className="bg-background p-6 flex flex-col">
                              <div className="flex-1 space-y-6">
                                <div>
                                  <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">
                                    Description
                                  </p>
                                  <p className="text-sm font-mono uppercase tracking-wider leading-relaxed">
                                    {(activeEvent ?? event).description}
                                  </p>
                                </div>
                                <div className="border-t border-border pt-4 space-y-4">
                                  {(activeEvent ?? event).location && (
                                    <div>
                                      <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2 flex items-center gap-2">
                                        <MapPin
                                          className="h-4 w-4 text-info"
                                          aria-hidden
                                        />
                                        Location
                                      </p>
                                      <p className="text-lg font-mono uppercase tracking-wider">
                                        {(activeEvent ?? event).location}
                                      </p>
                                    </div>
                                  )}
                                  {(activeEvent ?? event).eventDate && (
                                    <div>
                                      <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2 flex items-center gap-2">
                                        <CalendarHeart
                                          className="h-4 w-4 text-info"
                                          aria-hidden
                                        />
                                        Date
                                      </p>
                                      <p className="text-lg font-mono uppercase tracking-wider">
                                        {new Date(
                                          (activeEvent ?? event).eventDate
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </p>
                                    </div>
                                  )}
                                  {(activeEvent ?? event).capacity && (
                                    <div>
                                      <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2 flex items-center gap-2">
                                        <Users
                                          className="h-4 w-4"
                                          aria-hidden
                                        />
                                        Capacity
                                      </p>
                                      <p className="text-lg font-mono uppercase tracking-wider">
                                        {(activeEvent ?? event).capacity}{" "}
                                        attendees
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                                  <div>
                                    <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">
                                      Entry Price
                                    </p>
                                    <p className="text-3xl font-bold">
                                      ${(activeEvent ?? event).entryPrice}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">
                                      XP Reward
                                    </p>
                                    <p className="text-3xl font-bold text-info">
                                      +{(activeEvent ?? event).xpReward}
                                    </p>
                                  </div>
                                </div>
                                <div className="border-t border-border pt-4 space-y-2">
                                  <p className="text-xs font-mono text-muted-foreground">
                                    Required Level:{" "}
                                    <span className="text-foreground font-bold">
                                      {(activeEvent ?? event).requiredLevel}
                                    </span>
                                  </p>
                                </div>
                                {!user && (
                                  <div className="border border-destructive p-4">
                                    <p className="text-xs uppercase tracking-wider font-mono text-destructive">
                                      Login required to enter raffles.
                                    </p>
                                  </div>
                                )}
                              </div>
                              <DialogFooter className="gap-2 sm:gap-0 pt-6 border-t border-border mt-6">
                                <Button
                                  variant="outline"
                                  className="rounded-none uppercase tracking-wider"
                                  onClick={() => setEventModalId(null)}
                                >
                                  Close
                                </Button>
                                <Button
                                  className="rounded-none uppercase tracking-wider"
                                  disabled={
                                    !user || isEnded || !canAccess || hasEntered
                                  }
                                  onClick={async () => {
                                    if (!hasEntered && canAccess && user) {
                                      try {
                                        await api.raffles.enter(event.id);
                                        const entriesResponse =
                                          await api.raffles.getMyEntries();
                                        setMyEntries(entriesResponse.entries);
                                        setEventModalId(null);
                                      } catch (error) {
                                        alert(
                                          error instanceof Error
                                            ? error.message
                                            : "Failed to enter raffle"
                                        );
                                      }
                                    }
                                  }}
                                >
                                  {!canAccess
                                    ? "Locked"
                                    : hasEntered
                                    ? "Already Entered"
                                    : isEnded
                                    ? "Event Ended"
                                    : "Enter Raffle"}
                                </Button>
                              </DialogFooter>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
