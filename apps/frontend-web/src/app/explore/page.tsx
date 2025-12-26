"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Product } from "@shared/products";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

function TiltableProductCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [shinePosition, setShinePosition] = useState({ x: 50, y: 50 });

  const isSpecial = product.tags?.includes("3d-model") || false;

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY });
    setShinePosition({ x: shineX, y: shineY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <Link
      ref={cardRef}
      href={`/explore/${product.id}`}
      className={`group bg-background flex flex-col hover:bg-secondary/30 transition-colors relative overflow-hidden ${
        isSpecial ? "ring-2 ring-amber-400/50" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.1s ease-out",
      }}
    >
      {isSpecial && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/20 pointer-events-none z-0" />
      )}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10"
        style={{
          background: isSpecial
            ? `radial-gradient(circle 150px at ${shinePosition.x}% ${shinePosition.y}%, rgba(255, 215, 0, 0.25) 0%, transparent 70%)`
            : `radial-gradient(circle 150px at ${shinePosition.x}% ${shinePosition.y}%, rgba(255, 255, 255, 0.15) 0%, transparent 70%)`,
        }}
      />
      <div className="relative aspect-square w-full overflow-hidden p-8">
        <Image
          src={getImageUrl(product.images[0] || "/placeholder-product.jpg")}
          alt={product.name}
          fill
          className="p-4 object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={true}
        />
      </div>
      <div className="p-6 border-t border-muted mt-auto">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-bold uppercase leading-tight truncate">
            {product.name}
          </h3>
          <span className="font-mono text-md whitespace-nowrap">
            $
            {typeof product.price === "number"
              ? product.price.toFixed(2)
              : parseFloat(String(product.price)).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm font-mono text-muted-foreground uppercase mt-4">
          <span>{product.specifications?.Brand || "Brand Bazaar"}</span>
          {(typeof product.stock === "number"
            ? product.stock
            : parseFloat(String(product.stock)) || 0) > 0 ? (
            <span className="text-success">In Stock</span>
          ) : (
            <span className="text-destructive">Sold Out</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="uppercase tracking-widest animate-pulse">
            Loading products...
          </p>
        </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [inStock, setInStock] = useState<boolean | undefined>(
    searchParams.get("inStock") === "true"
      ? true
      : searchParams.get("inStock") === "false"
      ? false
      : undefined
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    (searchParams.get("sortOrder") as "ASC" | "DESC") || "DESC"
  );
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    updateURL({ search: searchInput || null });
    setSearchInput("");
    setLiveResults([]);
    setIsLiveSearching(false);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateURL({ category: value || null });
  };

  const handleInStockChange = (value: boolean | undefined) => {
    setInStock(value);
    updateURL({
      inStock: value === undefined ? null : value.toString(),
    });
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      const newOrder = sortOrder === "DESC" ? "ASC" : "DESC";
      setSortOrder(newOrder);
      updateURL({ sortBy: field, sortOrder: newOrder });
    } else {
      setSortBy(field);
      setSortOrder("DESC");
      updateURL({ sortBy: field, sortOrder: "DESC" });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setInStock(undefined);
    setSortBy("createdAt");
    setSortOrder("DESC");
    router.push("/explore", { scroll: false });
  };

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "";
    const urlInStock = searchParams.get("inStock");
    const urlSortBy = searchParams.get("sortBy") || "createdAt";
    const urlSortOrder =
      (searchParams.get("sortOrder") as "ASC" | "DESC") || "DESC";

    setSearch(urlSearch);
    setCategory(urlCategory);
    setInStock(
      urlInStock === "true" ? true : urlInStock === "false" ? false : undefined
    );
    setSortBy(urlSortBy);
    setSortOrder(urlSortOrder);
  }, [searchParams]);

  useEffect(() => {
    if (!searchInput.trim() || searchInput.trim().length < 3) {
      setLiveResults([]);
      setIsLiveSearching(false);
      return;
    }

    setIsLiveSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.products.getAll({
          search: searchInput.trim(),
          limit: 5,
          offset: 0,
        });
        setLiveResults(response.products);
      } catch {
        setLiveResults([]);
      } finally {
        setIsLiveSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const response = await api.products.getAll({
          search: search || undefined,
          category: category || undefined,
          inStock: inStock,
          sortBy: sortBy || undefined,
          sortOrder: sortOrder,
          limit: 50,
          offset: 0,
        });
        setProducts(response.products);
        setTotal(response.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [search, category, inStock, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="uppercase tracking-widest animate-pulse">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold uppercase">
            Error Loading Products
          </h1>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/">BACK TO HOME</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    search || category || inStock !== undefined || sortBy !== "createdAt";

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">
            {search ? `Search: ${search}` : "Explore"}
          </h1>
          <div className="text-xs font-mono text-muted-foreground">
            {total} ITEMS
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    // Küçük bir gecikme ekle, böylece dropdown içindeki butona tıklanırsa
                    // blur'dan önce click event'i tetiklenir
                    setTimeout(() => {
                      setIsSearchFocused(false);
                    }, 200);
                  }}
                  className="pl-10 rounded-none"
                />
              </form>

              {isSearchFocused && searchInput && searchInput.trim().length >= 3 && (
                <div className="absolute left-0 top-full mt-2 w-full bg-background border rounded-none shadow-lg z-30">
                  {!isLiveSearching && searchInput.trim() && liveResults.length === 0 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-widest">
                      No products found
                    </div>
                  )}

                  {liveResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="w-full px-4 py-2 hover:bg-muted flex items-center gap-3 text-left"
                      onClick={() => {
                        router.push(`/explore/${product.id}`);
                        setSearchInput("");
                        setLiveResults([]);
                        setIsLiveSearching(false);
                      }}
                    >
                      <div className="relative h-12 w-12 rounded-sm overflow-hidden bg-muted">
                        <Image
                          src={getImageUrl(product.images[0] || "/placeholder-product.jpg")}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized={true}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate uppercase">
                          {product.name}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          $
                          {typeof product.price === "number"
                            ? product.price.toFixed(2)
                            : parseFloat(String(product.price)).toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="h-9 px-3 pr-8 border border-input bg-background text-sm rounded-none uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_0.75rem_center]"
              >
                <option value="">All Categories</option>
                <option value="Running Shoes">Running Shoes</option>
                <option value="Basketball Shoes">Basketball Shoes</option>
                <option value="Lifestyle Shoes">Lifestyle Shoes</option>
                <option value="Training Shoes">Training Shoes</option>
                <option value="Sneakers">Sneakers</option>
              </select>

              <select
                value={inStock === undefined ? "" : inStock ? "true" : "false"}
                onChange={(e) =>
                  handleInStockChange(
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true"
                  )
                }
                className="h-9 px-3 pr-8 border border-input bg-background text-sm rounded-none uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_0.75rem_center]"
              >
                <option value="">All Stock</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order as "ASC" | "DESC");
                  updateURL({ sortBy: field, sortOrder: order });
                }}
                className="h-9 px-3 pr-8 border border-input bg-background text-sm rounded-none uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_0.75rem_center]"
              >
                <option value="createdAt-DESC">Newest First</option>
                <option value="createdAt-ASC">Oldest First</option>
                <option value="price-ASC">Price: Low to High</option>
                <option value="price-DESC">Price: High to Low</option>
                <option value="name-ASC">Name: A to Z</option>
                <option value="name-DESC">Name: Z to A</option>
                <option value="averageRating-DESC">Highest Rated</option>
                <option value="totalReviews-DESC">Most Reviews</option>
              </select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="rounded-none uppercase tracking-wider h-9"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="uppercase tracking-widest animate-pulse">
                Loading products...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold uppercase">
                Error Loading Products
              </h2>
              <p className="text-muted-foreground">{error}</p>
              <Button asChild variant="outline" className="rounded-none">
                <Link href="/">BACK TO HOME</Link>
              </Button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border">
            <p className="text-muted-foreground uppercase tracking-widest">
              No products found.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4 rounded-none uppercase tracking-wider"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-background border border-muted">
            {products.map((product) => (
              <TiltableProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


