"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Raffle } from "@shared/raffles";

export default function RafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    try {
      const data = await api.admin.raffles.getAll();
      setRaffles(data.raffles);
    } catch (error) {
      console.error("Failed to load raffles", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this raffle?")) return;
    try {
      await api.admin.raffles.delete(id);
      loadRaffles();
    } catch (error) {
      alert("Failed to delete raffle");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            Raffles
          </h1>
          <p className="text-muted-foreground">
            Manage sneaker and event raffles.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/raffles/new?type=sneaker">
            <Button className="rounded-none">
              <Plus className="mr-2 h-4 w-4" />
              Add Sneaker Raffle
            </Button>
          </Link>
          <Link href="/admin/raffles/new?type=event">
            <Button className="rounded-none">
              <Plus className="mr-2 h-4 w-4" />
              Add Event Raffle
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div>Loading raffles...</div>
      ) : (
        <div className="border-2 border-black">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 [&_tr]:border-b">
              <tr className="border-b border-black transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Type
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Entry Price
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  XP Reward
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Required Level
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {raffles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No raffles found. Create your first raffle to get started.
                  </td>
                </tr>
              ) : (
                raffles.map((raffle) => (
                  <tr
                    key={raffle.id}
                    className="border-b border-black transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-mono uppercase">
                      {raffle.type}
                    </td>
                    <td className="p-4 align-middle font-medium">
                      {raffle.name}
                    </td>
                    <td className="p-4 align-middle font-mono uppercase">
                      {raffle.status}
                    </td>
                    <td className="p-4 align-middle font-mono">
                      ${raffle.entryPrice}
                    </td>
                    <td className="p-4 align-middle font-mono">
                      +{raffle.xpReward} XP
                    </td>
                    <td className="p-4 align-middle font-mono">
                      {raffle.requiredLevel}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            router.push(`/admin/raffles/${raffle.id}`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(raffle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

