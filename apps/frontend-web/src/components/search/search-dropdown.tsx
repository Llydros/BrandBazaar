"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { api } from "@/lib/api";
import type { Product } from "@shared/products";
import { getImageUrl } from "@/lib/utils";

export function SearchDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Yazdıkça ürün arama (debounce ile)
  useEffect(() => {
    if (!query.trim() || query.trim().length < 3) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.products.getAll({
          search: query.trim(),
          limit: 5,
          offset: 0,
        });
        setResults(response.products);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
      setResults([]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:flex cursor-pointer"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-4 w-96 bg-background border rounded-none shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold uppercase tracking-wider">
                Search Products
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4">
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 rounded-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-none uppercase tracking-wider"
              >
                Search
              </Button>
            </form>
          </div>

          <div className="border-t max-h-80 overflow-y-auto">
            {!isSearching && query.trim().length >= 3 && results.length === 0 && (
              <div className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-widest">
                No products found
              </div>
            )}

            {query.trim().length >= 3 && results.map((product) => (
              <button
                key={product.id}
                type="button"
                className="w-full px-4 py-2 hover:bg-muted flex items-center gap-3 text-left text-sm"
                onClick={() => {
                  router.push(`/explore/${product.id}`);
                  setIsOpen(false);
                  setQuery("");
                  setResults([]);
                }}
              >
                <div className="relative h-10 w-10 rounded-sm overflow-hidden bg-muted">
                  <Image
                    src={getImageUrl(product.images[0] || "/placeholder-product.jpg")}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized={true}
                  />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                  <span className="font-medium truncate uppercase">
                    {product.name}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    $
                    {typeof product.price === "number"
                      ? product.price.toFixed(2)
                      : parseFloat(String(product.price)).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

