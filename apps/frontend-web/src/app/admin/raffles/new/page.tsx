"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RaffleForm } from "@/components/admin/raffle-form";
import { api } from "@/lib/api";
import { useState, useRef } from "react";

export default function NewRafflePage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
      <NewRafflePageInner />
    </Suspense>
  );
}

function NewRafflePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "sneaker" | "event") || "sneaker";
  const [isLoading, setIsLoading] = useState(false);
  const selectedFilesRef = useRef<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    selectedFilesRef.current = files;
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await api.admin.raffles.create(data);
      router.push("/admin/raffles");
    } catch (error) {
      console.error("Failed to create raffle", error);
      alert("Failed to create raffle. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">
          Create {type === "sneaker" ? "Sneaker" : "Event"} Raffle
        </h1>
        <p className="text-muted-foreground">
          Add a new raffle to the platform.
        </p>
      </div>
      <RaffleForm
        type={type}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onFilesSelected={handleFilesSelected}
      />
    </div>
  );
}

