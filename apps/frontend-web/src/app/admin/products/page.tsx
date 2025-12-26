"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Product } from "@shared/products";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.products.getAll({ limit: 100 }); // Fetch more for admin
      setProducts(data.products);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.admin.products.delete(id);
      loadProducts();
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            Products
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="rounded-none">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div>Loading products...</div>
      ) : (
        <div className="border-2 border-black">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 [&_tr]:border-b">
              <tr className="border-b border-black transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Product Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Category
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Price
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Stock
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-black transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle font-medium">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      {product.images?.[0] && (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="h-10 w-10 object-cover border border-black"
                        />
                      )}
                      {product.name}
                    </div>
                  </td>
                  <td className="p-4 align-middle">{product.category}</td>
                  <td className="p-4 align-middle font-mono">
                    ${product.price}
                  </td>
                  <td className="p-4 align-middle font-mono">
                    {product.stock}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          router.push(`/admin/products/${product.id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

