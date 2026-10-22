"use client";

import { useParams } from "next/navigation";
import { ItemForm } from "../../../../components/item-form";

export default function EditItemPage() {
  const params = useParams<{ id: string }>();
  return <ItemForm itemId={Number(params.id)} />;
}
