"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Shield,
  Info,
  AlertCircle,
} from "lucide-react";

interface InstallmentsInfoProps {
  monthlyPayment: number;
  totalPrice: number;
}

export function InstallmentsInfo({
  monthlyPayment,
  totalPrice,
}: InstallmentsInfoProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-info hover:underline flex items-center gap-1"
        >
          <CreditCard className="w-4 h-4" />
          <span className="font-medium text-info">
            4 interest-free installments:
          </span>
          <span className="font-semibold">
            {formatPrice(monthlyPayment)}/month
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-info" />
            Installment Payment Plan
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Spread your payment over 4 interest-free installments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Summary */}
          <div className="bg-background border border-info rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Payment Schedule
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-foreground">Total Amount:</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              {[1, 2, 3, 4].map((installment) => (
                <div
                  key={installment}
                  className="flex items-center justify-between py-2 bg-background border border-border rounded-lg px-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-info text-foreground font-bold text-sm">
                      {installment}
                    </span>
                    <div>
                      <span className="font-medium text-foreground">
                        {installment === 1
                          ? "First"
                          : installment === 2
                          ? "Second"
                          : installment === 3
                          ? "Third"
                          : "Fourth"}{" "}
                        Payment
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {installment === 1 && "Due at checkout"}
                        {installment === 2 && "Due in 30 days"}
                        {installment === 3 && "Due in 60 days"}
                        {installment === 4 && "Due in 90 days"}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-info">
                    {formatPrice(monthlyPayment)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-background border border-success rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Key Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                <span>
                  <strong>0% Interest</strong> - No hidden fees or charges
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                <span>
                  <strong>Instant Approval</strong> - Quick and easy setup
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                <span>
                  <strong>Flexible</strong> - Pay over 90 days
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                <span>
                  <strong>Secure</strong> - Bank-level encryption
                </span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-background border border-info rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              How It Works
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-info text-foreground font-bold text-xs flex-shrink-0">
                  1
                </span>
                <p className="text-sm text-foreground">
                  <strong>Select Installments:</strong> Choose the 4-payment
                  plan at checkout
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-info text-foreground font-bold text-xs flex-shrink-0">
                  2
                </span>
                <p className="text-sm text-foreground">
                  <strong>Pay First Installment:</strong> Your first payment is
                  due immediately
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-info text-foreground font-bold text-xs flex-shrink-0">
                  3
                </span>
                <p className="text-sm text-foreground">
                  <strong>Automatic Payments:</strong> Remaining payments are
                  auto-charged every 30 days
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-info text-foreground font-bold text-xs flex-shrink-0">
                  4
                </span>
                <p className="text-sm text-foreground">
                  <strong>Complete Purchase:</strong> Own your item after the
                  4th payment
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-background border border-warning rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Requirements
            </h3>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="font-semibold">✓</span>
                <span>Valid credit or debit card</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">✓</span>
                <span>Minimum purchase of $50</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">✓</span>
                <span>18 years or older</span>
              </li>
            </ul>
          </div>

          {/* Security & Terms */}
          <div className="bg-background border border-info rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Terms
            </h3>
            <p className="text-sm text-foreground">
              Your payment information is secured with 256-bit SSL encryption.
              All payments are processed through our secure payment gateway. By
              choosing this payment plan, you agree to have the remaining
              installments automatically charged to your card every 30 days. You
              can cancel future payments or change your payment method anytime
              from your account dashboard.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
