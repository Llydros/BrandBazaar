"use client";

import { ProductForm } from "@/components/admin/product-form";
import { api } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ProductWithReviews } from "@shared/products";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<ProductWithReviews | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedFilesRef = useRef<File[]>([]);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await api.products.getById(id);
      setProduct(data.product);
    } catch (error) {
      console.error("Failed to load product", error);
      alert("Failed to load product");
      router.push("/admin/products");
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    selectedFilesRef.current = files;
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [...(product?.images || [])];

      if (selectedFilesRef.current.length > 0) {
        const uploadResponse = await api.admin.products.uploadFiles(selectedFilesRef.current);
        imageUrls = [...imageUrls, ...uploadResponse.files];
      }

      const productData = {
        ...data,
        images: imageUrls,
      };

      await api.admin.products.update(id, productData);
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to update product", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct && !product) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return null;
  }

  // Map product to form values
  const defaultValues = {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category || "",
    images: product.images,
    isPublic: product.isPublic ?? true,
    // @ts-ignore - Variants might be populated in backend but types in shared lib are tricky sometimes
    variants: product.variants?.map(v => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        stockQuantity: v.stockQuantity,
        priceModifier: v.priceModifier,
    })) || [],
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Edit Product</h1>
        <p className="text-muted-foreground">
          Update product details and variants.
        </p>
      </div>
      
      <div className="bg-background border p-6 shadow-sm">
        <ProductForm 
            defaultValues={defaultValues} 
            onSubmit={handleSubmit} 
            isLoading={isSubmitting} 
            isEdit={true}
            onFilesSelected={handleFilesSelected}
        />
      </div>
    </div>
  );
}

