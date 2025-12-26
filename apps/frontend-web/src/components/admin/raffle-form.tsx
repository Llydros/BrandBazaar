"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { Product } from "@shared/products";

const raffleSchema = z.object({
  type: z.enum(["sneaker", "event"]),
  name: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  entryPrice: z.number().positive(),
  xpReward: z.number().int().min(0),
  requiredLevel: z.enum(["Hobbyist", "Enthusiast", "Sneakerhead"]),
  releaseDate: z.string().optional(),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().int().min(0).optional(),
  status: z.enum(["active", "upcoming", "ended"]).optional(),
  productId: z.string().uuid().optional().nullable(),
});

type RaffleFormValues = z.infer<typeof raffleSchema>;

interface RaffleFormProps {
  defaultValues?: Partial<RaffleFormValues>;
  onSubmit: (data: RaffleFormValues) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
  type: "sneaker" | "event";
  onFilesSelected?: (files: File[]) => void;
}

export function RaffleForm({
  defaultValues,
  onSubmit,
  isLoading,
  isEdit,
  type,
  onFilesSelected,
}: RaffleFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RaffleFormValues>({
    resolver: zodResolver(raffleSchema),
    defaultValues: defaultValues || {
      type,
      name: "",
      description: "",
      imageUrl: "",
      entryPrice: 0,
      xpReward: 0,
      requiredLevel: "Hobbyist",
      status: "active",
      productId: null,
    },
  });

  useEffect(() => {
    if (defaultValues?.imageUrl) {
      setImagePreviews([defaultValues.imageUrl]);
    }
  }, [defaultValues]);

  useEffect(() => {
    if (type === "sneaker") {
      api.products.getAll({ limit: 100 }).then((response) => {
        setProducts(response.products);
      });
    }
  }, [type]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);

    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }
  };

  const handleFormSubmit = async (data: RaffleFormValues) => {
    if (selectedFiles.length > 0) {
      const uploadResponse = await api.admin.raffles.uploadFiles(selectedFiles);
      if (uploadResponse.files.length > 0) {
        data.imageUrl = uploadResponse.files[0];
      }
    }
    if (!data.imageUrl && !isEdit) {
      alert("Please upload an image or provide an image URL");
      return;
    }
    await onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            {type === "sneaker" ? "Sneaker Name" : "Event Title"}
          </Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Raffle Image</Label>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-none"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              {!selectedFiles.length && (
                <div className="flex-1">
                  <Input
                    id="imageUrl"
                    placeholder="Or enter image URL"
                    {...form.register("imageUrl")}
                  />
                </div>
              )}
            </div>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={
                        preview.startsWith("blob:")
                          ? preview
                          : getImageUrl(preview)
                      }
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {type === "sneaker" && (
          <div className="space-y-2">
            <Label htmlFor="productId">Link Product (Optional)</Label>
            <select
              id="productId"
              {...form.register("productId")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            >
              <option value="">None</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="entryPrice">Entry Price ($)</Label>
          <Input
            id="entryPrice"
            type="number"
            step="0.01"
            {...form.register("entryPrice", { valueAsNumber: true })}
          />
          {form.formState.errors.entryPrice && (
            <p className="text-sm text-destructive">
              {form.formState.errors.entryPrice.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="xpReward">XP Reward</Label>
          <Input
            id="xpReward"
            type="number"
            {...form.register("xpReward", { valueAsNumber: true })}
          />
          {form.formState.errors.xpReward && (
            <p className="text-sm text-destructive">
              {form.formState.errors.xpReward.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="requiredLevel">Required Level</Label>
          <select
            id="requiredLevel"
            {...form.register("requiredLevel")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
          >
            <option value="Hobbyist">Hobbyist</option>
            <option value="Enthusiast">Enthusiast</option>
            <option value="Sneakerhead">Sneakerhead</option>
          </select>
        </div>

        {type === "sneaker" ? (
          <div className="space-y-2">
            <Label htmlFor="releaseDate">Release Date</Label>
            <Input
              id="releaseDate"
              type="datetime-local"
              {...form.register("releaseDate")}
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="datetime-local"
                {...form.register("eventDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...form.register("location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                {...form.register("capacity", { valueAsNumber: true })}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            {...form.register("status")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
          >
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          className="min-h-[100px]"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message as string}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full md:w-auto rounded-none uppercase font-bold"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : isEdit ? "Update Raffle" : "Create Raffle"}
      </Button>
    </form>
  );
}

