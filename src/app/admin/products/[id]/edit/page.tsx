"use client";

import { use } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { ProductFormPage } from "@/components/admin/ProductFormPage";
import { notFound } from "next/navigation";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { products } = useAdminStore();
  const product = products.find((p) => p.id === id);

  if (!product) return notFound();

  return <ProductFormPage mode="edit" initialProduct={product} />;
}
