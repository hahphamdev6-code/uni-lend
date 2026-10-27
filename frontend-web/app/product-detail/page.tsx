import ProductDetailPage from "../items/[id]/page";

export default function DefaultProductDetailPage() {
  return <ProductDetailPage params={Promise.resolve({ id: "sony-a7-iv" })} />;
}
