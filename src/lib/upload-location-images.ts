/**
 * Uploads a single image file to Supabase Storage via the server-side route handler.
 * The route handler creates the "location-images" bucket on first use.
 *
 * Prerequisite: add SUPABASE_SERVICE_ROLE_KEY to .env.local
 * (Supabase Dashboard → Project Settings → API → service_role secret)
 */
export async function uploadLocationImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload-location-image", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Upload failed (${res.status})`);
  }

  const { url } = await res.json();
  return url as string;
}
