"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PaymentMethod } from "@shared/payment-methods";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  value: string | null;
  onChange: (paymentMethodId: string) => void;
  headerAction?: React.ReactNode;
}

export function PaymentSelector({ value, onChange, headerAction }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => api.paymentMethods.getAll(),
  });
  const methods = data?.paymentMethods ?? [];
  const [selected, setSelected] = useState<string | null>(value);

  useEffect(() => {
    if (!selected && methods.length > 0) {
      setSelected(methods[0].id);
      onChange(methods[0].id);
    }
  }, [methods, onChange, selected]);

  if (isLoading) {
    return (
      <Card className="rounded-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="uppercase tracking-wider text-sm">
              Payment Method
            </CardTitle>
            {headerAction}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-1/4" />
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
            Payment Method
          </CardTitle>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent>
        {methods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No payment methods found. Add one in your profile to continue.
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
            {methods.map((method: PaymentMethod) => (
              <Label
                key={method.id}
                className="flex items-start gap-3 border p-3 cursor-pointer"
              >
                <RadioGroupItem value={method.id} />
                <span className="text-sm">
                  <div className="font-semibold">
                    {method.brand} ending in {method.last4}
                  </div>
                  <div className="text-muted-foreground">
                    {method.expiryMonth && method.expiryYear
                      ? `${method.expiryMonth}/${method.expiryYear}`
                      : "No expiry set"}
                  </div>
                </span>
              </Label>
            ))}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  );
}

