"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
} from "@shared/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { getImageUrl } from "@/lib/utils";

// react-hook-form deals with *input* shapes (before Zod defaults/coercions),
// so align the form value type with the schema input types.
type ProductFormValues =
  | z.input<typeof CreateProductRequestSchema>
  | z.input<typeof UpdateProductRequestSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
  onFilesSelected?: (files: File[]) => void;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isLoading,
  isEdit,
  onFilesSelected,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(
      isEdit ? UpdateProductRequestSchema : CreateProductRequestSchema
    ),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      images: [],
      variants: [],
    },
  });

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      const resetValues = {
        ...defaultValues,
        variants:
          defaultValues.variants?.map((v) => ({
            ...v,
            priceModifier: v.priceModifier ?? 0,
          })) || [],
      };
      form.reset(resetValues);
    }
  }, [defaultValues]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);

    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }
  };

  const generateSKU = (
    productName: string,
    size: string,
    color: string
  ): string => {
    const namePart = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 6);
    const sizePart = size.replace(/[^0-9.]/g, "").padStart(4, "0");
    const colorPart = color
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 3);
    return `${namePart}-${sizePart}-${colorPart}`;
  };

  const usShoeSizes: number[] = [];
  for (let size = 4; size <= 15; size += 0.5) {
    usShoeSizes.push(size);
  }

  const handleFormSubmit = useCallback(async () => {
    if (isLoading) return;

    const formData = form.getValues();
    const productName = formData.name || "";

    if (formData.variants) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      formData.variants = formData.variants.map((v: any) => {
        const cleaned: any = {
          sku: v.sku || generateSKU(productName, v.size || "", v.color || ""),
          size: v.size,
          color: v.color,
          stockQuantity: v.stockQuantity,
          priceModifier: v.priceModifier ?? 0,
        };
        if (
          isEdit &&
          v.id &&
          typeof v.id === "string" &&
          uuidRegex.test(v.id)
        ) {
          cleaned.id = v.id;
        }
        return cleaned;
      });
      form.setValue("variants", formData.variants);
    }

    const isValid = await form.trigger();
    if (!isValid) {
      console.log("Form validation errors:", form.formState.errors);
      console.log("Form values:", form.getValues());
      return;
    }

    await onSubmit(formData);
  }, [isLoading, isEdit, form, onSubmit]);

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Base Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...form.register("price", { valueAsNumber: true })}
          />
          {form.formState.errors.price && (
            <p className="text-sm text-destructive">
              {form.formState.errors.price.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...form.register("category")}
            className="h-9 px-3 pr-8 border border-input bg-background text-sm rounded-none uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_0.75rem_center] w-full"
          >
            <option value="">Select Category</option>
            <option value="Running Shoes">Running Shoes</option>
            <option value="Basketball Shoes">Basketball Shoes</option>
            <option value="Lifestyle Shoes">Lifestyle Shoes</option>
            <option value="Training Shoes">Training Shoes</option>
            <option value="Sneakers">Sneakers</option>
          </select>
          {form.formState.errors.category && (
            <p className="text-sm text-destructive">
              {form.formState.errors.category.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Total Stock</Label>
          <Input
            id="stock"
            type="number"
            {...form.register("stock", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2 flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isPublic"
            {...form.register("isPublic")}
            className="h-4 w-4"
          />
          <Label htmlFor="isPublic" className="cursor-pointer">
            Public (visible in explore page)
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          className="min-h-[100px]"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Product Images</Label>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-none uppercase"
            >
              <Upload className="mr-2 h-4 w-4" />
              Select Images
            </Button>
            {selectedFiles.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedFiles.length} file
                {selectedFiles.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {isEdit &&
            defaultValues?.images &&
            defaultValues.images.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Existing Images
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {defaultValues.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageUrl(url)}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover border border-border"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="space-y-4 border-2 border-black p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase">Variants</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                sku: "",
                size: "",
                color: "",
                stockQuantity: 0,
                priceModifier: 0,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-4 md:grid-cols-5 items-end border-b pb-4"
          >
            <input type="hidden" {...form.register(`variants.${index}.id`)} />
            <input type="hidden" {...form.register(`variants.${index}.sku`)} />

            <div className="space-y-2">
              <Label>Size (US)</Label>
              <select
                {...form.register(`variants.${index}.size`)}
                className="h-9 px-3 pr-8 border border-input bg-background text-sm rounded-none uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_0.75rem_center] w-full"
              >
                <option value="">Select Size</option>
                {usShoeSizes.map((size) => (
                  <option key={size} value={size.toString()}>
                    {size}
                  </option>
                ))}
              </select>
              {form.formState.errors.variants?.[index]?.size && (
                <p className="text-sm text-destructive">
                  {
                    form.formState.errors.variants[index]?.size
                      ?.message as string
                  }
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                {...form.register(`variants.${index}.color`)}
                placeholder="Red"
              />
              {form.formState.errors.variants?.[index]?.color && (
                <p className="text-sm text-destructive">
                  {
                    form.formState.errors.variants[index]?.color
                      ?.message as string
                  }
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input
                type="number"
                {...form.register(`variants.${index}.stockQuantity`, {
                  valueAsNumber: true,
                })}
              />
              {form.formState.errors.variants?.[index]?.stockQuantity && (
                <p className="text-sm text-destructive">
                  {
                    form.formState.errors.variants[index]?.stockQuantity
                      ?.message as string
                  }
                </p>
              )}
            </div>
            <div className="flex-1" />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        onClick={handleFormSubmit}
        className="w-full md:w-auto rounded-none uppercase font-bold"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}
