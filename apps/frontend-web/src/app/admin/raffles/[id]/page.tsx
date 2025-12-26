"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { RaffleForm } from "@/components/admin/raffle-form";
import { api } from "@/lib/api";
import { Raffle } from "@shared/raffles";

export default function EditRafflePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedFilesRef = useRef<File[]>([]);

  useEffect(() => {
    loadRaffle();
  }, [id]);

  const loadRaffle = async () => {
    try {
      const data = await api.admin.raffles.getById(id);
      setRaffle(data.raffle);
    } catch (error) {
      console.error("Failed to load raffle", error);
      alert("Failed to load raffle");
      router.push("/admin/raffles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    selectedFilesRef.current = files;
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (selectedFilesRef.current.length > 0) {
        const uploadResponse = await api.admin.raffles.uploadFiles(
          selectedFilesRef.current
        );
        if (uploadResponse.files.length > 0) {
          data.imageUrl = uploadResponse.files[0];
        }
      }
      await api.admin.raffles.update(id, data);
      router.push("/admin/raffles");
    } catch (error) {
      console.error("Failed to update raffle", error);
      alert("Failed to update raffle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !raffle) {
    return <div>Loading...</div>;
  }

  const defaultValues = {
    type: raffle.type,
    name: raffle.name,
    description: raffle.description,
    imageUrl: raffle.imageUrl,
    entryPrice: raffle.entryPrice,
    xpReward: raffle.xpReward,
    requiredLevel: raffle.requiredLevel,
    releaseDate: raffle.releaseDate
      ? new Date(raffle.releaseDate).toISOString().slice(0, 16)
      : undefined,
    eventDate: raffle.eventDate
      ? new Date(raffle.eventDate).toISOString().slice(0, 16)
      : undefined,
    location: raffle.location ?? undefined,
    capacity: raffle.capacity ?? undefined,
    status: raffle.status,
    productId: raffle.productId ?? null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">
          Edit Raffle
        </h1>
        <p className="text-muted-foreground">Update raffle details.</p>
      </div>
      <RaffleForm
        type={raffle.type}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isEdit
        isLoading={isSubmitting}
        onFilesSelected={handleFilesSelected}
      />
    </div>
  );
}

