"use client";

import { ProductForm } from "@/components/admin/product-form";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const selectedFilesRef = useRef<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    selectedFilesRef.current = files;
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let imageUrls: string[] = [];

      if (selectedFilesRef.current.length > 0) {
        const uploadResponse = await api.admin.products.uploadFiles(selectedFilesRef.current);
        imageUrls = uploadResponse.files;
      }

      const productData = {
        ...data,
        images: imageUrls,
      };

      await api.admin.products.create(productData);
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product", error);
      alert("Failed to create product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Add New Product</h1>
        <p className="text-muted-foreground">
          Create a new product with variants.
        </p>
      </div>
      
      <div className="bg-background border p-6 shadow-sm">
        <ProductForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
          onFilesSelected={handleFilesSelected}
        />
      </div>
    </div>
  );
}

