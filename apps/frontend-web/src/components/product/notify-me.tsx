"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";

interface NotifyMeProps {
  productId: string;
  productName: string;
  isOutOfStock: boolean;
  hasSalePrice?: boolean;
  unavailableSizes?: { size: string; stock: number }[];
}

export function NotifyMe({ productId, productName, isOutOfStock, hasSalePrice, unavailableSizes = [] }: NotifyMeProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationType, setNotificationType] = useState<"stock" | "price">("stock");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    // Require at least one size selection for stock notifications
    if (notificationType === "stock" && unavailableSizes.length > 0 && selectedSizes.length === 0) {
      alert("Please select at least one size to be notified about");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Save to localStorage
      const key = `notify_${notificationType}_${productId}`;
      localStorage.setItem(key, JSON.stringify({
        email,
        productId,
        productName,
        type: notificationType,
        sizes: selectedSizes,
        subscribedAt: new Date().toISOString(),
      }));
      
      setIsLoading(false);
      setIsSubscribed(true);
      setIsOpen(false);
      
      // Show success message
      const sizeText = selectedSizes.length > 0 ? ` for size(s) ${selectedSizes.join(", ")}` : "";
      alert(`You'll be notified when this product is ${notificationType === "stock" ? "back in stock" : "on sale"}${sizeText}`);
    }, 1000);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  if (isSubscribed) {
    return (
      <Button variant="outline" disabled className="w-full">
        <Bell className="w-4 h-4 mr-2" />
        You're Subscribed!
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Bell className="w-4 h-4 mr-2" />
          {(isOutOfStock && !hasSalePrice) ? "Notify When In Stock" : hasSalePrice ? "Notify Me of Deals" : "Get Notifications"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get Notified</DialogTitle>
          <DialogDescription>
            We'll send you an email when this product {isOutOfStock && notificationType === "stock" ? "comes back in stock" : "goes on sale"}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Notification Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notify me when:</label>
            <div className="flex gap-2">
              {isOutOfStock && (
                <Button
                  type="button"
                  variant={notificationType === "stock" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setNotificationType("stock");
                    // Don't clear sizes when switching to stock
                  }}
                  className="flex-1"
                >
                  Back in Stock
                </Button>
              )}
              <Button
                type="button"
                variant={notificationType === "price" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setNotificationType("price");
                  setSelectedSizes([]); // Clear sizes when switching to price
                }}
                className="flex-1"
              >
                Price Drops
              </Button>
            </div>
          </div>

          {/* Size Selection for Stock Notifications */}
          {notificationType === "stock" && unavailableSizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select sizes to be notified about:</label>
              <div className="flex flex-wrap gap-2">
                {unavailableSizes.map(({ size, stock }) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-3 py-2 border rounded-lg font-medium transition-all ${
                      selectedSizes.includes(size)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSizes.length === 0 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Please select at least one size
                </p>
              )}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="notify-email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="notify-email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubscribe} 
            disabled={
              isLoading || 
              (notificationType === "stock" && unavailableSizes.length > 0 && selectedSizes.length === 0)
            }
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

