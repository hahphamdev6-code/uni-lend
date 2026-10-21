export function resolveImageUrl(imageUrl: string): string {
  const apiBaseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
  ).replace(/\/$/, "");

  return new URL(imageUrl, `${apiBaseUrl}/`).toString();
}
