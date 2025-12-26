"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoeRotator } from "@/components/ShoeRotator";
import { ProductHeroSlider } from "@/components/ProductHeroSlider";
import { api } from "@/lib/api";
import { Product } from "@shared/products";
import { Raffle } from "@shared/raffles";
import { CalendarHeart, MapPin, Flame } from "lucide-react";

export default function Home() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [eventRaffles, setEventRaffles] = useState<Raffle[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    async function fetchTrendingProducts() {
      try {
        const response = await api.products.getAll({ limit: 5 });
        setTrendingProducts(response.products);
      } catch (err) {
        console.error("Failed to load trending products", err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    async function fetchEventRaffles() {
      try {
        const response = await api.raffles.getAll();
        const events = response.raffles.filter(
          (raffle) => raffle.type === "event" && raffle.status === "upcoming"
        );
        setEventRaffles(events.slice(0, 3));
      } catch (err) {
        console.error("Failed to load event raffles", err);
      } finally {
        setIsLoadingEvents(false);
      }
    }
    fetchEventRaffles();
  }, []);

  return (
    <main className="flex min-h-screen flex-col py-4">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-background flex items-center">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center h-full">
          <div className="flex flex-col gap-6 z-10">
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter uppercase leading-[0.8]">
              Brand
              <br />
              Bazaar
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Elevate your rotation with the latest drops. Exclusive access to
              the most sought-after sneakers.
            </p>
            <div className="flex gap-4">
              <Link href="/explore">
                <Button
                  size="lg"
                  className="rounded-none text-lg px-8 h-14 hover:bg-foreground/90 font-bold uppercase tracking-widest text-background"
                >
                  Explore
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-full p-4 min-h-[400px] md:min-h-full flex items-center justify-center">
            <ShoeRotator />
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 p-4 opacity-20 font-mono text-sm">
          EST. 2025
        </div>
      </section>

      {/* Marquee / Brand Strip */}
      <section className="mt-5 py-4 bg-foreground text-background overflow-hidden whitespace-nowrap">
        <div className="flex w-full">
          <div className="animate-marquee flex min-w-full shrink-0 items-center justify-around">
            {Array(10)
              .fill("NEW ARRIVALS // EXCLUSIVE DROPS // LIMITED EDITION // ")
              .map((text, i) => (
                <span key={i} className="font-mono font-bold mx-4 text-sm">
                  {text}
                </span>
              ))}
          </div>
          <div className="animate-marquee flex min-w-full shrink-0 items-center justify-around">
            {Array(10)
              .fill("NEW ARRIVALS // EXCLUSIVE DROPS // LIMITED EDITION // ")
              .map((text, i) => (
                <span
                  key={`dup-${i}`}
                  className="font-mono font-bold mx-4 text-sm"
                >
                  {text}
                </span>
              ))}
          </div>
        </div>
      </section>

      {/* Featured Categories / Hero Slider */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-error" aria-hidden />
              <h2 className="text-4xl font-bold uppercase tracking-tight text-foreground">
                Trending Now
              </h2>
            </div>
            <Link
              href="/explore"
              className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground hover:text-muted-foreground transition-colors"
            >
              View All{" "}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="relative w-full h-[600px] flex items-center justify-center bg-muted/20 ">
              <div className="text-muted-foreground uppercase tracking-widest animate-pulse">
                Loading...
              </div>
            </div>
          ) : (
            <ProductHeroSlider products={trendingProducts} />
          )}
        </div>
      </section>

      {/* Upcoming Events Section */}
      {eventRaffles.length > 0 && (
        <section className="my-6 bg-background ">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div className="flex items-center gap-3">
                <CalendarHeart className="h-6 w-6 text-info" aria-hidden />
                <h2 className="text-4xl font-bold uppercase tracking-tight text-foreground">
                  Upcoming Events
                </h2>
              </div>
              <Link
                href="/raffles"
                className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground hover:text-muted-foreground transition-colors"
              >
                View All{" "}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {isLoadingEvents ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-background p-6 h-64 animate-pulse">
                    <div className="h-32 bg-muted mb-4" />
                    <div className="h-4 bg-muted mb-2 w-3/4" />
                    <div className="h-4 bg-muted w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {eventRaffles.map((raffle) => (
                  <Link
                    key={raffle.id}
                    href="/raffles"
                    className="group bg-background transition-colors flex flex-col"
                  >
                    <div className="relative w-full h-48 overflow-hidden bg-muted/20">
                      <Image
                        src={raffle.imageUrl}
                        alt={raffle.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold uppercase mb-2 text-foreground group-hover:text-foreground transition-colors line-clamp-2">
                        {raffle.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                        {raffle.description}
                      </p>
                      <div className="space-y-2 pt-4">
                        {raffle.location && (
                          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{raffle.location}</span>
                          </div>
                        )}
                        {raffle.eventDate && (
                          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                            <CalendarHeart className="h-3 w-3" />
                            <span>
                              {new Date(raffle.eventDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm font-mono text-foreground">
                            ${raffle.entryPrice}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            +{raffle.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
