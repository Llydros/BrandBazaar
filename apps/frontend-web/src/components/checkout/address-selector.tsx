"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Address } from "@shared/addresses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  value: string | null;
  onChange: (addressId: string) => void;
  headerAction?: React.ReactNode;
}

export function AddressSelector({ value, onChange, headerAction }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.addresses.getAll(),
  });
  const addresses = data?.addresses ?? [];
  const [selected, setSelected] = useState<string | null>(value);

  useEffect(() => {
    if (!selected && addresses.length > 0) {
      setSelected(addresses[0].id);
      onChange(addresses[0].id);
    }
  }, [addresses, onChange, selected]);

  if (isLoading) {
    return (
      <Card className="rounded-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="uppercase tracking-wider text-sm">
              Shipping Address
            </CardTitle>
            {headerAction}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="uppercase tracking-wider text-sm">
            Shipping Address
          </CardTitle>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any addresses yet. Add one in your profile to
            continue.
          </p>
        ) : (
          <RadioGroup
            value={selected ?? undefined}
            onValueChange={(val: string) => {
              setSelected(val);
              onChange(val);
            }}
            className="space-y-3"
          >
            {addresses.map((address: Address) => (
              <Label
                key={address.id}
                className="flex items-start gap-3 border p-3 cursor-pointer"
              >
                <RadioGroupItem value={address.id} />
                <span className="text-sm">
                  <div className="font-semibold">{address.label || "Home"}</div>
                  <div>{address.street}</div>
                  <div>
                    {address.city}, {address.state} {address.zipCode}
                  </div>
                  <div>{address.country}</div>
                </span>
              </Label>
            ))}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  );
}

