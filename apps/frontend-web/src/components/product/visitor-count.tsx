"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface VisitorCountProps {
  productId: string;
}

export function VisitorCount({ productId }: VisitorCountProps) {
  const [viewerCount, setViewerCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      // Get count from localStorage or generate random count for demo
      const saved = localStorage.getItem(`visitor_count_${productId}`);
      if (saved) {
        return parseInt(saved, 10);
      }
      // Generate random initial count between 15-35 for demo
      const randomCount = Math.floor(Math.random() * 21) + 15;
      return randomCount;
    }
    return 20;
  });

  useEffect(() => {
    // Update visitor count in localStorage on mount
    const increment = Math.floor(Math.random() * 3) + 1; // Random increment 1-3
    const newCount = viewerCount + increment;
    setViewerCount(newCount);
    localStorage.setItem(`visitor_count_${productId}`, newCount.toString());
  }, [productId]); // Only run once on mount

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Users className="w-4 h-4 animate-pulse text-blue-500" />
      <span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{viewerCount}</span>{" "}
        people are viewing this right now
      </span>
    </div>
  );
}

