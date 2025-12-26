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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

import Shoe1 from "@/assets/Shoe1.png";
import Shoe2 from "@/assets/Shoe2.png";
import Shoe3 from "@/assets/Shoe3.png";
import MeetupImage from "@/assets/meetup.jpg";
import PartyImage from "@/assets/party.jpg";

const sneakerRaffles = [
  {
    id: "raffle-1",
    name: "Nike Air Jordan 1 Retro High OG",
    brand: "Nike",
    model: "Air Jordan 1",
    releaseDate: "Feb 29, 2026 – 09:00 PST",
    description:
      "Classic silhouette with premium leather construction. Limited release.",
    image: Shoe1,
    entryPrice: 180,
    xpReward: 50,
    requiredLevel: "Hobbyist",
  },
  {
    id: "raffle-2",
    name: "Adidas Yeezy Boost 350 V2",
    brand: "Adidas",
    model: "Yeezy Boost 350 V2",
    releaseDate: "Mar 15, 2026 – 10:00 EST",
    description:
      "Ultra-comfortable primeknit upper with responsive Boost midsole.",
    image: Shoe2,
    entryPrice: 220,
    xpReward: 75,
    requiredLevel: "Enthusiast",
  },
  {
    id: "raffle-3",
    name: "Nike Dunk Low Retro",
    brand: "Nike",
    model: "Dunk Low",
    releaseDate: "Mar 28, 2026 – 12:00 PST",
    description:
      "Timeless design meets modern comfort. Perfect for everyday wear.",
    image: Shoe3,
    entryPrice: 120,
    xpReward: 50,
    requiredLevel: "Hobbyist",
  },
];

const eventRaffles = [
  {
    id: "event-1",
    title: "Sneakerhead Meetup",
    location: "Brooklyn Warehouse 212",
    date: "Mar 01, 2026",
    description:
      "Connect with fellow collectors, trade stories, and discover rare finds.",
    image: MeetupImage,
    entryPrice: 15,
    capacity: 120,
    xpReward: 100,
    requiredLevel: "Hobbyist",
  },
  {
    id: "event-2",
    title: "DJ Party & Sneaker Showcase",
    location: "Kadıköy Ferry Terminal",
    date: "Mar 20, 2026",
    description:
      "Night of music, exclusive drops, and streetwear culture celebration.",
    image: PartyImage,
    entryPrice: 40,
    capacity: 300,
    xpReward: 150,
    requiredLevel: "Enthusiast",
  },
];

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

export default function EventsPage() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeRaffle, setActiveRaffle] = useState<
    (typeof sneakerRaffles)[0] | null
  >(null);
  const [activeEvent, setActiveEvent] = useState<
    (typeof eventRaffles)[0] | null
  >(null);
  const [raffleModalId, setRaffleModalId] = useState<string | null>(null);
  const [eventModalId, setEventModalId] = useState<string | null>(null);
  const [raffleForm, setRaffleForm] = useState({
    email: "",
    ssn: "",
    size: "",
  });
  const [eventNotes, setEventNotes] = useState("");

  const attendee = useMemo(() => user?.email ?? "Guest", [user?.email]);

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

  const resetRaffleForm = () =>
    setRaffleForm({ email: user?.email ?? "", ssn: "", size: "" });

  useEffect(() => {
    const dismissed = localStorage.getItem("events-onboarding-dismissed");
    if (dismissed === "true") {
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
  }, []);

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
                        className="h-full bg-info transition-all"
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
                Upcoming Releases
              </h2>
            </div>
            <div className="space-y-6">
              {sneakerRaffles.map((raffle) => (
                <div
                  key={raffle.id}
                  className="border border-border bg-background group hover:border-foreground transition-colors h-60 flex"
                >
                  <div className="relative w-48 flex-shrink-0 overflow-hidden bg-secondary">
                    <Image
                      src={raffle.image}
                      alt={raffle.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300 rotate-270"
                    />
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex-1 space-y-2">
                      <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                        {raffle.brand}
                      </p>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">
                        {raffle.name}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground">
                        {raffle.releaseDate}
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
                          onClick={() => {
                            setActiveRaffle(raffle);
                            resetRaffleForm();
                            setRaffleModalId(raffle.id);
                          }}
                        >
                          Enter Raffle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-full max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="uppercase tracking-tighter">
                            {activeRaffle?.name ?? raffle.name}
                          </DialogTitle>
                          <DialogDescription className="uppercase tracking-wider font-mono text-xs">
                            Enter the raffle for a chance to purchase this
                            exclusive release at the listed price.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-px md:grid-cols-2 bg-border border border-border">
                          <div className="bg-background p-6 space-y-4">
                            <div className="relative aspect-square overflow-hidden bg-secondary border border-border">
                              <Image
                                src={(activeRaffle ?? raffle).image}
                                alt={(activeRaffle ?? raffle).name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="bg-background text-foreground p-4 space-y-2 border border-border">
                              <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                Details
                              </p>
                              <p className="text-xs text-foreground font-mono uppercase tracking-wider">
                                {(activeRaffle ?? raffle).description}
                              </p>
                              <div className="pt-2 space-y-1 border-t border-border">
                                <p className="text-xs font-mono text-muted-foreground">
                                  Required Level:{" "}
                                  {(activeRaffle ?? raffle).requiredLevel}
                                </p>
                                <p className="text-xs font-mono text-muted-foreground">
                                  XP Reward: +
                                  {(activeRaffle ?? raffle).xpReward}
                                </p>
                              </div>
                            </div>
                          </div>
                          <form className="bg-background p-6 space-y-4">
                            <div>
                              <Label
                                htmlFor="raffle-email"
                                className="uppercase tracking-wider font-mono text-xs"
                              >
                                Email
                              </Label>
                              <Input
                                id="raffle-email"
                                type="email"
                                required
                                className="rounded-none"
                                value={raffleForm.email}
                                onChange={(e) =>
                                  setRaffleForm((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="raffle-ssn"
                                className="uppercase tracking-wider font-mono text-xs"
                              >
                                Social security (last 4)
                              </Label>
                              <Input
                                id="raffle-ssn"
                                inputMode="numeric"
                                maxLength={4}
                                required
                                className="rounded-none"
                                value={raffleForm.ssn}
                                onChange={(e) =>
                                  setRaffleForm((prev) => ({
                                    ...prev,
                                    ssn: e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 4),
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="raffle-size"
                                className="uppercase tracking-wider font-mono text-xs"
                              >
                                Preferred size (EU)
                              </Label>
                              <Input
                                id="raffle-size"
                                placeholder="43"
                                className="rounded-none"
                                value={raffleForm.size}
                                onChange={(e) =>
                                  setRaffleForm((prev) => ({
                                    ...prev,
                                    size: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            {!user && (
                              <p className="text-xs uppercase tracking-wider font-mono text-destructive border border-destructive p-3">
                                Please log in to enter raffles.
                              </p>
                            )}
                          </form>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button
                            variant="outline"
                            className="rounded-none uppercase tracking-wider"
                            onClick={() => setRaffleModalId(null)}
                          >
                            Close
                          </Button>
                          <Button
                            type="submit"
                            className="rounded-none uppercase tracking-wider"
                            disabled={!user}
                          >
                            Enter Raffle
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-border pb-4">
              <CalendarHeart className="h-6 w-6 text-info" aria-hidden />
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-foreground">
                Exclusive Events
              </h2>
            </div>
            <div className="space-y-6">
              {eventRaffles.map((event) => (
                <div
                  key={event.id}
                  className="border border-border bg-background group hover:border-foreground transition-colors h-60 flex"
                >
                  <div className="relative w-48 flex-shrink-0 overflow-hidden bg-secondary">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">
                        {event.title}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-info" aria-hidden />
                        {event.location}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {event.date}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                          Entry
                        </p>
                        <p className="text-lg font-bold">${event.entryPrice}</p>
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
                          onClick={() => {
                            setActiveEvent(event);
                            setEventNotes("");
                            setEventModalId(event.id);
                          }}
                        >
                          Enter Raffle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-full max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="uppercase tracking-tighter">
                            {activeEvent?.title ?? event.title}
                          </DialogTitle>
                          <DialogDescription className="uppercase tracking-wider font-mono text-xs">
                            Enter the raffle for a chance to attend this
                            exclusive event.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-px md:grid-cols-2 bg-border border border-border">
                          <div className="bg-background p-6 space-y-4">
                            <div className="relative aspect-video overflow-hidden bg-secondary border border-border">
                              <Image
                                src={(activeEvent ?? event).image}
                                alt={(activeEvent ?? event).title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="border border-border p-4 space-y-3">
                              <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground flex items-center gap-2">
                                <MapPin
                                  className="h-4 w-4 text-info"
                                  aria-hidden
                                />
                                {(activeEvent ?? event).location}
                              </p>
                              <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground flex items-center gap-2">
                                <CalendarHeart
                                  className="h-4 w-4 text-info"
                                  aria-hidden
                                />
                                {(activeEvent ?? event).date}
                              </p>
                              <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mt-2 flex items-center gap-2">
                                <Users className="h-4 w-4" aria-hidden />
                                Capacity {(activeEvent ?? event).capacity}{" "}
                                attendees
                              </p>
                              <div className="pt-2 space-y-1 border-t border-border">
                                <p className="text-xs font-mono text-muted-foreground">
                                  Required Level:{" "}
                                  {(activeEvent ?? event).requiredLevel}
                                </p>
                                <p className="text-xs font-mono text-muted-foreground">
                                  XP Reward: +{(activeEvent ?? event).xpReward}
                                </p>
                              </div>
                            </div>
                          </div>
                          <form className="bg-background p-6 space-y-4 border border-border">
                            <div>
                              <Label
                                htmlFor="event-email"
                                className="uppercase tracking-wider font-mono text-xs"
                              >
                                Email
                              </Label>
                              <Input
                                id="event-email"
                                type="email"
                                className="rounded-none"
                                defaultValue={user?.email ?? ""}
                                required
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="event-notes"
                                className="uppercase tracking-wider font-mono text-xs"
                              >
                                Notes (allergies / arrival windows)
                              </Label>
                              <Textarea
                                id="event-notes"
                                className="rounded-none"
                                placeholder="Need vegan bites, arriving with 2 friends..."
                                value={eventNotes}
                                onChange={(e) => setEventNotes(e.target.value)}
                              />
                            </div>
                            {!user && (
                              <p className="text-xs uppercase tracking-wider font-mono text-destructive border border-destructive p-3">
                                Login required to enter raffles.
                              </p>
                            )}
                          </form>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button
                            variant="outline"
                            className="rounded-none uppercase tracking-wider"
                            onClick={() => setEventModalId(null)}
                          >
                            Close
                          </Button>
                          <Button
                            className="rounded-none uppercase tracking-wider"
                            disabled={!user}
                          >
                            Enter Raffle
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
