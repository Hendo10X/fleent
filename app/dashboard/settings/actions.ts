"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function postUpdateUser(body: { name?: string; image?: string | null }) {
  const h = await headers();
  const cookie = h.get("cookie");
  if (!cookie) return { ok: false as const, error: "Not signed in" };

  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";

  const res = await fetch(`${proto}://${host}/api/auth/update-user`, {
    method: "POST",
    headers: {
      cookie,
      "Content-Type": "application/json",
      Origin: `${proto}://${host}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false as const, error: text || res.statusText };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}

export async function updateDisplayName(name: string) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 120) {
    return { ok: false as const, error: "Enter a name up to 120 characters." };
  }
  return postUpdateUser({ name: trimmed });
}

export async function updateAvatarUrl(imageUrl: string) {
  const url = imageUrl.trim();
  if (!url.startsWith("http")) {
    return { ok: false as const, error: "Invalid image URL." };
  }
  return postUpdateUser({ image: url });
}

export async function clearAvatar() {
  return postUpdateUser({ image: null });
}

export async function deleteAccount() {
  const h = await headers();
  const cookie = h.get("cookie");
  if (!cookie) return { ok: false as const, error: "Not signed in" };

  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";

  const res = await fetch(`${proto}://${host}/api/auth/delete-user`, {
    method: "POST",
    headers: {
      cookie,
      "Content-Type": "application/json",
      Origin: `${proto}://${host}`,
    },
    body: JSON.stringify({ callbackURL: "/login" }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false as const, error: text || res.statusText };
  }

  return { ok: true as const };
}
