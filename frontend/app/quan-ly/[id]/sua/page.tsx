import { ItemEditor } from "../../../../components/item-editor";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ItemEditor itemId={id} />;
}