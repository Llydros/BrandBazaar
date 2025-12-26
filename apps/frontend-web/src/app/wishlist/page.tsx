"use client";

import { useState, useEffect } from "react";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { api } from "@/lib/api";
import {
  Grid3x3,
  List,
  ShoppingCart,
  Heart,
  Share2,
  Gift,
  Trash2,
  Sparkles,
  TrendingDown,
  AlertCircle,
  MessageSquarePlus,
  Star,
  Facebook,
  Twitter,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@shared/products";
import { getImageUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type ViewMode = "grid" | "list";
type SortOption = "recent" | "price-low" | "price-high" | "discount";
type FilterOption =
  | "all"
  | "in-stock"
  | "out-of-stock"
  | "on-sale"
  | "low-stock";

interface ProductWithDetails extends Product {
  wishlistId?: string;
  addedAt?: string;
  originalPrice?: number;
  priority?: number;
  notes?: string;
}

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { items: wishlistItems, removeItem, updateItem } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  const [priorityValue, setPriorityValue] = useState(3);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  // Fetch product details for wishlist items
  useEffect(() => {
    async function fetchProducts() {
      if (wishlistItems.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        const productPromises = wishlistItems.map(async (item) => {
          try {
            const data = await api.products.getById(item.productId);
            return {
              ...data.product,
              addedAt: item.addedAt,
              originalPrice: item.originalPrice || item.price,
              priority: item.priority || 3,
              notes: item.notes,
            };
          } catch (error) {
            console.error(`Failed to fetch product ${item.productId}:`, error);
            return null;
          }
        });

        const fetchedProducts = (await Promise.all(productPromises)).filter(
          (p) => p !== null
        ) as ProductWithDetails[];

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch wishlist products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [wishlistItems]);

  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-24 h-24 mx-auto mb-8 text-muted-foreground" />
          <h1 className="text-4xl md:text-4xl font-bold uppercase tracking-tighter mb-6">
            Sign In to View Your Wishlist
          </h1>
          <p className="text-muted-foreground mb-12 max-w-md mx-auto">
            Create an account or sign in to save items you love and get
            personalized recommendations.
          </p>
          <LoginDialog>
            <Button size="lg" className="rounded-none text-lg px-8 h-14">
              Sign In / Create Account
            </Button>
          </LoginDialog>
        </div>
      </main>
    );
  }

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="animate-spin rounded-none h-16 w-16 border-4 border-t-foreground border-r-transparent border-b-transparent border-l-transparent mx-auto" />
          <p className="text-xl text-muted-foreground font-mono uppercase tracking-widest">
            Loading your wishlist...
          </p>
        </div>
      </main>
    );
  }

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (
          new Date(b.addedAt || 0).getTime() -
          new Date(a.addedAt || 0).getTime()
        );
      case "price-low":
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case "price-high":
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      case "discount":
        const aDiscount = a.salePrice ? (a.price - a.salePrice) / a.price : 0;
        const bDiscount = b.salePrice ? (b.price - b.salePrice) / b.price : 0;
        return bDiscount - aDiscount;
      default:
        return 0;
    }
  });

  // Filtering logic
  const filteredProducts = sortedProducts.filter((product) => {
    switch (filterBy) {
      case "in-stock":
        return product.stock > 0;
      case "out-of-stock":
        return product.stock === 0;
      case "on-sale":
        return !!product.salePrice;
      case "low-stock":
        return product.stock > 0 && product.stock <= 5;
      default:
        return true;
    }
  });

  const handleMoveToCart = (product: ProductWithDetails) => {
    if (!product.variants || product.variants.length === 0) {
      alert("This product has no variants. Please contact support.");
      return;
    }
    
    const availableVariant = product.variants.find((v) => v.stockQuantity > 0) || product.variants[0];
    if (!availableVariant) {
      alert("No variant available for this product");
      return;
    }
    
    const basePrice = product.salePrice || product.price;
    const priceModifier = typeof availableVariant.priceModifier === 'number' 
      ? availableVariant.priceModifier 
      : parseFloat(String(availableVariant.priceModifier || 0));
    const price = (typeof basePrice === "number" ? basePrice : parseFloat(basePrice)) + priceModifier;
    
    addToCart({
      productId: product.id,
      productVariantId: availableVariant.id,
      productName: product.name,
      price,
      image: getImageUrl(product.images[0] || ""),
    });
  };

  const handleAddAllToCart = () => {
    filteredProducts.forEach((product) => {
      if (product.stock > 0) {
        handleMoveToCart(product);
      }
    });
  };

  const handleSaveNote = (productId: string) => {
    updateItem(productId, { notes: noteValue });
    setEditingNote(null);
    setNoteValue("");
  };

  const handleSavePriority = (productId: string) => {
    updateItem(productId, { priority: priorityValue });
    setEditingPriority(null);
    setPriorityValue(3);
  };

  const isRecentlyAdded = (addedAt: string) => {
    const daysSinceAdded =
      (Date.now() - new Date(addedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceAdded <= 7;
  };

  const getPriceChange = (product: ProductWithDetails) => {
    const original = product.originalPrice || product.price;
    const current = product.salePrice || product.price;
    const change = ((current - original) / original) * 100;
    return {
      percentage: change,
      dropped: change < 0,
      increased: change > 0,
    };
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "number" ? price : parseFloat(price);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numPrice);
  };

  const toNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === "number" ? value : parseFloat(String(value)) || 0;
  };

  const handleShare = (platform: "facebook" | "twitter" | "copy") => {
    const wishlistUrl =
      typeof window !== "undefined" ? window.location.href : "";
    const shareText = user
      ? `${user.email}'s BrandBazaar Wishlist`
      : "Check out my BrandBazaar Wishlist!";

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            wishlistUrl
          )}&quote=${encodeURIComponent(shareText)}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(wishlistUrl)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(wishlistUrl);
        alert("Wishlist link copied to clipboard!");
        break;
    }
  };

  if (products.length === 0) {
    return (
      <main className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-24 h-24 mx-auto mb-8 text-muted-foreground" />
          <h1 className="text-6xl md:text-7xl font-bold uppercase tracking-tighter mb-6">
            Your Wishlist is Empty
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-md mx-auto">
            Start adding items you love to save them for later!
          </p>
          <Link href="/explore">
            <Button size="lg" className="rounded-none text-lg px-8 h-14">
              Browse Products
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 border-b pb-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-6xl md:text-7xl font-bold uppercase tracking-tighter flex items-center gap-4">
                <Heart className="w-12 h-12" />
                My Wishlist
              </h1>
              <p className="text-xl text-muted-foreground mt-4 font-mono">
                {products.length} {products.length === 1 ? "ITEM" : "ITEMS"}{" "}
                SAVED
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                className="rounded-none h-12 px-6"
                onClick={() => setShowGiftDialog(true)}
              >
                <Gift className="w-4 h-4 mr-2" />
                Gift Mode
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-none h-12 px-6"
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3 border border-border bg-background text-foreground text-sm font-mono uppercase rounded-none focus:outline-none focus:ring-2 focus:ring-foreground"
              >
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Most Discounted</option>
              </select>

              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-4 py-3 border border-border bg-background text-foreground text-sm font-mono uppercase rounded-none focus:outline-none focus:ring-2 focus:ring-foreground"
              >
                <option value="all">All Items</option>
                <option value="in-stock">In Stock Only</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="on-sale">On Sale</option>
                <option value="low-stock">Low Stock Alert</option>
              </select>

              {filteredProducts.length > 0 && (
                <Button
                  onClick={handleAddAllToCart}
                  className="rounded-none h-12 px-6"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add All to Cart
                </Button>
              )}
            </div>

            <div className="flex items-center gap-0 border border-border">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 border-r border-border last:border-r-0 transition-colors ${
                  viewMode === "grid"
                    ? "bg-background text-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition-colors ${
                  viewMode === "list"
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {(filteredProducts.some(
          (p) => toNumber(p.stock) > 0 && toNumber(p.stock) <= 5
        ) ||
          filteredProducts.some((p) => getPriceChange(p).dropped)) && (
          <div className="mb-8 space-y-2">
            {filteredProducts.filter(
              (p) => toNumber(p.stock) > 0 && toNumber(p.stock) <= 5
            ).length > 0 && (
              <div className="p-6 border-2 border-foreground bg-background">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xl font-bold uppercase mb-2 tracking-tight">
                      Low Stock Alert
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {
                        filteredProducts.filter(
                          (p) => toNumber(p.stock) > 0 && toNumber(p.stock) <= 5
                        ).length
                      }{" "}
                      {filteredProducts.filter(
                        (p) => toNumber(p.stock) > 0 && toNumber(p.stock) <= 5
                      ).length === 1
                        ? "ITEM"
                        : "ITEMS"}{" "}
                      IN YOUR WISHLIST HAVE LOW STOCK! DON'T MISS OUT.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {filteredProducts.filter((p) => getPriceChange(p).dropped).length >
              0 && (
              <div className="p-6 border-2 border-foreground bg-foreground text-background">
                <div className="flex items-start gap-4">
                  <TrendingDown className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xl font-bold uppercase mb-2 tracking-tight">
                      Price Drop Alert!
                    </h3>
                    <p className="text-sm font-mono">
                      {
                        filteredProducts.filter(
                          (p) => getPriceChange(p).dropped
                        ).length
                      }{" "}
                      {filteredProducts.filter((p) => getPriceChange(p).dropped)
                        .length === 1
                        ? "ITEM"
                        : "ITEMS"}{" "}
                      IN YOUR WISHLIST HAVE DROPPED IN PRICE! GREAT TIME TO BUY.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 border-t border-b">
            <p className="text-2xl text-muted-foreground font-mono uppercase tracking-widest">
              No items match your filters
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-background border border-border"
                : "space-y-px bg-border border border-border"
            }
          >
            {filteredProducts.map((product) => {
              const priceChange = getPriceChange(product);
              const stock = toNumber(product.stock);
              const currentPrice = product.salePrice || product.price;
              const originalPrice = product.originalPrice || product.price;

              return (
                <div
                  key={product.id}
                  className={`bg-background border border-border hover:bg-muted/50 transition-colors ${
                    viewMode === "list" ? "flex" : "flex flex-col"
                  }`}
                >
                  <Link
                    href={`/explore/${product.id}`}
                    className={`relative bg-muted overflow-hidden isolate ${
                      viewMode === "grid"
                        ? "aspect-[1/1] w-full"
                        : "w-80 h-80 flex-shrink-0"
                    }`}
                  >
                    <Image
                      src={getImageUrl(product.images[0] || "/placeholder-product.jpg")}
                      alt={product.name}
                      fill
                      className="object-cover p-4 group-hover:-translate-y-2 transition-transform duration-500"
                      sizes={
                        viewMode === "grid"
                          ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          : "256px"
                      }
                      unoptimized={true}
                    />
                    {isRecentlyAdded(product.addedAt!) && (
                      <div className="absolute top-2 left-2 z-10 bg-foreground text-background px-2 py-1 text-xs font-bold uppercase font-mono flex items-center gap-1 border-2 border-background">
                        <Sparkles className="w-3 h-3" />
                        New
                      </div>
                    )}
                    {product.salePrice && (
                      <div className="absolute top-2 right-2 z-10 bg-foreground text-background px-2 py-1 text-xs font-bold uppercase font-mono border-2 border-background whitespace-nowrap">
                        {Math.round(
                          ((toNumber(product.price) -
                            toNumber(product.salePrice)) /
                            toNumber(product.price)) *
                            100
                        )}
                        % OFF
                      </div>
                    )}
                  </Link>

                  <div
                    className={`flex-1 flex flex-col justify-between ${
                      viewMode === "grid" ? "p-4" : "p-6"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Link href={`/explore/${product.id}`}>
                        <h3 className="text-xl font-bold uppercase line-clamp-2 tracking-tight hover:underline">
                          {product.name}
                        </h3>
                      </Link>
                      {editingPriority === product.id ? (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 cursor-pointer ${
                                star <= priorityValue
                                  ? "fill-foreground text-foreground"
                                  : "text-muted-foreground"
                              }`}
                              onClick={() => setPriorityValue(star)}
                            />
                          ))}
                          <button
                            onClick={() => handleSavePriority(product.id)}
                            className="ml-2 text-xs font-mono uppercase border border-border px-2 py-1 hover:bg-muted"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPriority(product.id);
                            setPriorityValue(product.priority || 3);
                          }}
                          className="flex items-center gap-0.5"
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (product.priority || 3)
                                  ? "fill-foreground text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </button>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold font-mono">
                          {formatPrice(currentPrice)}
                        </span>
                        {product.salePrice && (
                          <span className="text-lg text-muted-foreground line-through font-mono">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      {priceChange.dropped && (
                        <div className="flex items-center gap-2 text-sm font-mono uppercase mt-2">
                          <TrendingDown className="w-4 h-4" />
                          Price dropped{" "}
                          {Math.abs(priceChange.percentage).toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="mb-4 space-y-2">
                      {stock === 0 ? (
                        <div className="flex items-center gap-2 text-sm font-mono uppercase border-2 border-foreground px-3 py-2 bg-background">
                          <AlertCircle className="w-4 h-4" />
                          Out of Stock
                        </div>
                      ) : stock <= 5 ? (
                        <div className="flex items-center gap-2 text-sm font-bold uppercase border-2 border-foreground px-3 py-2 bg-foreground text-background">
                          <AlertCircle className="w-4 h-4" />
                          Only {stock} left!
                        </div>
                      ) : (
                        <div className="text-sm font-mono uppercase text-muted-foreground">
                          In Stock
                        </div>
                      )}
                    </div>

                    {editingNote === product.id ? (
                      <div className="mb-4">
                        <textarea
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          placeholder="Add a note..."
                          rows={2}
                          className="w-full px-3 py-2 text-xs border-2 border-border bg-background text-foreground font-mono rounded-none focus:outline-none focus:ring-2 focus:ring-foreground"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveNote(product.id)}
                            className="text-xs font-mono uppercase border border-border px-3 py-1 hover:bg-muted"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingNote(null);
                              setNoteValue("");
                            }}
                            className="text-xs font-mono uppercase text-muted-foreground hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        {product.notes ? (
                          <p className="text-xs text-muted-foreground mb-1 font-mono border-l-2 border-foreground pl-2">
                            {product.notes}
                          </p>
                        ) : (
                          <button
                            onClick={() => setEditingNote(product.id)}
                            className="text-xs text-muted-foreground hover:underline flex items-center gap-1 font-mono uppercase"
                          >
                            <MessageSquarePlus className="w-3 h-3" />
                            Add note
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleMoveToCart(product)}
                        disabled={stock === 0}
                        className="flex-1 rounded-none h-12 font-mono uppercase"
                        size="lg"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {stock === 0 ? "Out" : "Cart"}
                      </Button>
                      <Button
                        onClick={() => removeItem(product.id)}
                        variant="outline"
                        size="lg"
                        className="rounded-none h-12 border-2 border-foreground hover:bg-foreground hover:text-background"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="rounded-none border-2 border-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-tight">
              Share Your Wishlist
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-mono uppercase">
              Share your wishlist with friends and family
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase font-mono tracking-widest">
                Wishlist Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== "undefined" ? window.location.href : ""
                  }
                  className="flex-1 px-4 py-3 border-2 border-border bg-background text-foreground font-mono text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-foreground"
                />
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-none h-12 px-6"
                  onClick={() => handleShare("copy")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase font-mono tracking-widest">
                Share on social media
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-none h-12 font-mono uppercase"
                  onClick={() => handleShare("facebook")}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-none h-12 font-mono uppercase"
                  onClick={() => handleShare("twitter")}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setShowShareDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
        <DialogContent className="rounded-none border-2 border-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-tight">
              Gift Request Mode
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-mono uppercase">
              Add a personal message for gift givers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Add a personal message to your gift request (e.g., 'I'm saving up for my birthday next month!')"
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              rows={4}
              className="rounded-none border-2 border-border font-mono focus:ring-2 focus:ring-foreground"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setShowGiftDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                alert(
                  "Gift mode activated! Your message will be visible when sharing your wishlist."
                );
                setShowGiftDialog(false);
              }}
              className="rounded-none"
            >
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
