"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { User } from "@phosphor-icons/react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AvatarUploadButton } from "@/components/uploadthing-components";
import {
  clearAvatar,
  deleteAccount,
  updateAvatarUrl,
  updateDisplayName,
} from "@/app/dashboard/settings/actions";

interface UserProps {
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export function SettingsClient({ user: initialUser }: { user: UserProps }) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name);
  const [deletePhrase, setDeletePhrase] = useState("");

  const memberSince = formatMemberSince(initialUser.createdAt);

  const saveNameMutation = useMutation({
    mutationFn: () => updateDisplayName(name),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Name updated");
        router.refresh();
      } else {
        toast.error("Could not update name", { description: res.error });
      }
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: (url: string) => updateAvatarUrl(url),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Photo updated");
        router.refresh();
      } else {
        toast.error("Could not save photo", { description: res.error });
      }
    },
  });

  const clearAvatarMutation = useMutation({
    mutationFn: clearAvatar,
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Photo removed");
        router.refresh();
      } else {
        toast.error("Could not remove photo", {
          description: res.error,
        });
      }
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Account deleted");
        router.push("/login");
        router.refresh();
      } else {
        toast.error("Could not delete account", { description: res.error });
      }
    },
  });

  const isBusy =
    saveNameMutation.isPending ||
    updateAvatarMutation.isPending ||
    clearAvatarMutation.isPending ||
    deleteAccountMutation.isPending;

  function handleSaveName(e: FormEvent) {
    e.preventDefault();
    saveNameMutation.mutate();
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      <section className="rounded-2xl bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3]">
            {initialUser.image ? (
              <Image
                src={initialUser.image}
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-fleent-ink">
                <User size={20} weight="duotone" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-fleent-ink">
              {initialUser.name}
            </p>
            <p className="truncate text-xs tracking-wide text-fleent-mute">
              {initialUser.email}
            </p>
          </div>

          <AvatarUploadButton
            endpoint="avatar"
            appearance={{
              button:
                "inline-flex h-9 cursor-pointer items-center justify-center rounded-[999px] bg-[#F3F3F3] px-3.5 text-sm font-semibold tracking-wide text-fleent-ink transition-colors hover:bg-[#EAEAEA] ut-uploading:pointer-events-none ut-uploading:opacity-70",
              allowedContent: "hidden",
            }}
            content={{ button: "Upload" }}
            onClientUploadComplete={(files) => {
              const first = files[0];
              const url = first?.url ?? first?.ufsUrl;
              if (!url) {
                toast.error("Upload finished without a URL");
                return;
              }
              updateAvatarMutation.mutate(url);
            }}
            onUploadError={(err) => {
              toast.error("Upload failed", { description: err.message });
            }}
          />
        </div>

        {initialUser.image ? (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => clearAvatarMutation.mutate()}
              className="text-xs font-semibold tracking-wide text-fleent-mute transition-colors hover:text-fleent-ink disabled:opacity-50"
            >
              Remove photo
            </button>
          </div>
        ) : null}
      </section>

      <form onSubmit={handleSaveName} className="rounded-2xl bg-white px-4 py-4">
        <label
          htmlFor="display-name"
          className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase"
        >
          Name
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="display-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className="min-w-0 flex-1 rounded-xl bg-[#F6F6FE] px-3 py-2.5 text-base font-semibold tracking-tight text-fleent-ink outline-none focus-visible:ring-2 focus-visible:ring-fleent-orange/30"
            autoComplete="name"
          />
          <button
            type="submit"
            disabled={
              saveNameMutation.isPending || name.trim() === initialUser.name
            }
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-fleent-ink px-4 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-fleent-ink/90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saveNameMutation.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>

      <section className="rounded-2xl bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
            Account
          </span>
          <span className="text-xs tracking-wide text-fleent-mute">
            Member since {memberSince}
          </span>
        </div>

        <div className="mt-3 flex flex-col">
          <RowLink href="/privacy" label="Privacy policy" />
          <RowLink href="/terms" label="Terms" />
          <RowText label="Email status" value={initialUser.emailVerified ? "Verified" : "Not verified"} />
          <RowText label="Account email" value={initialUser.email} mono />
        </div>
      </section>

      <section className="rounded-2xl bg-white px-4 py-4">
        <span className="text-xs font-semibold tracking-[0.12em] text-fleent-mute uppercase">
          Danger
        </span>

        <p className="mt-2 text-sm tracking-wide text-fleent-mute">
          Deleting your account removes your tasks and streaks from the database.
        </p>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={deletePhrase}
            onChange={(e) => setDeletePhrase(e.target.value)}
            placeholder='Type "delete"'
            className="min-w-0 flex-1 rounded-xl bg-[#F6F6FE] px-3 py-2.5 text-sm font-semibold tracking-tight text-fleent-ink outline-none focus-visible:ring-2 focus-visible:ring-fleent-orange/30"
          />
          <button
            type="button"
            disabled={
              deleteAccountMutation.isPending ||
              deletePhrase.trim().toLowerCase() !== "delete"
            }
            onClick={() => deleteAccountMutation.mutate()}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#F3F3F3] px-4 text-sm font-semibold tracking-wide text-fleent-ink transition-colors hover:bg-[#EAEAEA] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Delete
          </button>
        </div>
      </section>

      <div className="mt-4 flex justify-start">
        <SignOutButton className="w-full rounded-full border-transparent bg-fleent-orange px-6 py-3 text-white shadow-none hover:bg-fleent-orange/90 *:data-[slot=button-loading-indicator]:text-white" />
      </div>
    </div>
  );
}

function RowLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl px-2.5 py-2 text-sm font-semibold tracking-tight text-fleent-ink transition-colors hover:bg-[#F3F3F3]"
    >
      {label}
      <span className="text-fleent-mute">›</span>
    </Link>
  );
}

function RowText({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl px-2.5 py-2">
      <span className="text-sm font-semibold tracking-tight text-fleent-ink">
        {label}
      </span>
      <span
        className={`text-sm tracking-wide text-fleent-mute ${mono ? "break-all text-right" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function formatMemberSince(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}
