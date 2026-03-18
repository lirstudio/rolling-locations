/**
 * Uploads the user's avatar to Supabase Storage and returns the public URL.
 * Caller should then persist the URL via updateUserMetadata({ avatar_url: url }).
 */
export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload-avatar", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string })?.error ?? `Upload failed (${res.status})`);
  }

  const { url } = await res.json();
  return url as string;
}
