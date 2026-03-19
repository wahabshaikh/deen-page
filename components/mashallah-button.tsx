"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SparklesIconComponent } from "@/components/icons";
import { useSession } from "@/lib/auth-client";

const MASHALLAH_STORAGE_KEY = "deen:mashallah:";

function getHasReactedFromStorage(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage?.getItem(`${MASHALLAH_STORAGE_KEY}${slug}`) === "1";
}

function setReactedInStorage(slug: string, reacted: boolean) {
  if (typeof window === "undefined") return;
  if (reacted) {
    window.localStorage?.setItem(`${MASHALLAH_STORAGE_KEY}${slug}`, "1");
  } else {
    window.localStorage?.removeItem(`${MASHALLAH_STORAGE_KEY}${slug}`);
  }
}

interface MashallahButtonProps {
  slug: string;
  initialCount?: number;
  compact?: boolean;
  onCountChange?: (count: number) => void;
}

export function MashallahButton({
  slug,
  initialCount = 0,
  compact = false,
  onCountChange,
}: MashallahButtonProps) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { data: session, isPending: sessionPending } = useSession();

  // Single source of state: count and hasReacted. Updated from API only after mutations or initial GET.
  const [state, setState] = useState<{ count: number; hasReacted: boolean }>(() => ({
    count: initialCount,
    hasReacted: getHasReactedFromStorage(slug),
  }));
  const [syncedFromServer, setSyncedFromServer] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { count, hasReacted } = state;

  // When logged in, fetch server state once and use it as source of truth
  useEffect(() => {
    if (!session || syncedFromServer) return;
    let cancelled = false;
    fetch(`/api/projects/${slug}/engagement`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { reacted?: boolean; mashallahCount?: number } | null) => {
        if (cancelled || !data) return;
        setState((prev) => ({
          count: typeof data.mashallahCount === "number" ? data.mashallahCount : prev.count,
          hasReacted: !!data.reacted,
        }));
        setReactedInStorage(slug, !!data.reacted);
        setSyncedFromServer(true);
      });
    return () => {
      cancelled = true;
    };
  }, [session, slug, syncedFromServer]);

  // When not logged in yet, keep count in sync with initialCount (e.g. after nav)
  useEffect(() => {
    if (syncedFromServer) return;
    setState((prev) => ({ ...prev, count: initialCount }));
  }, [initialCount, syncedFromServer]);

  const isLoggedIn = !!session;
  const canToggle = isLoggedIn && !isPending;
  const showSignInModal = !sessionPending && !isLoggedIn;

  function handleClick() {
    if (showSignInModal) {
      dialogRef.current?.showModal();
      return;
    }
    if (!canToggle) return;

    const action = hasReacted ? "remove" : "add";
    startTransition(async () => {
      try {
        const res = await fetch(`/api/projects/${slug}/engagement`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "mashallah", action }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Failed to update Mashallah.");

        const nextCount = typeof data?.counts?.mashallahCount === "number"
          ? data.counts.mashallahCount
          : count + (action === "add" ? 1 : -1);
        const nextReacted = !!data.reacted;

        setState({ count: Math.max(0, nextCount), hasReacted: nextReacted });
        setReactedInStorage(slug, nextReacted);
        onCountChange?.(Math.max(0, nextCount));
      } catch (error) {
        console.error("Mashallah toggle failed:", error);
      }
    });
  }

  const baseClasses = compact
    ? "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
    : "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors";

  const stateClasses = hasReacted
    ? "border-primary/30 bg-primary/15 text-primary"
    : "border-base-300 bg-base-200/70 text-base-content/80 hover:border-primary/30 hover:text-primary";

  const content = (
    <>
      <SparklesIconComponent size={compact ? 14 : 16} />
      <span>Mashallah</span>
      <span className="tabular-nums text-current/80">{count}</span>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`${baseClasses} ${stateClasses}`}
        aria-pressed={hasReacted}
        aria-busy={isPending}
        aria-label={`Say mashallah for this project. ${count} reactions so far.`}
      >
        {content}
      </button>

      <dialog
        ref={dialogRef}
        className="modal"
        aria-modal="true"
        aria-labelledby="mashallah-signin-modal-title"
      >
        <div className="modal-box max-w-sm">
          <h2 id="mashallah-signin-modal-title" className="text-lg font-semibold">
            Sign in to say Mashallah
          </h2>
          <p className="mt-2 text-sm text-base-content/70">
            Sign in to back this project and help it get seen by the community.
          </p>
          <div className="modal-action">
            <Link
              href={`/signin?callbackUrl=${encodeURIComponent(pathname ?? "/")}`}
              className="btn btn-primary rounded-full"
            >
              Sign in
            </Link>
            <form method="dialog">
              <button type="submit" className="btn btn-ghost rounded-full">
                Cancel
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit" className="size-full min-h-screen cursor-default" aria-label="Close modal" />
        </form>
      </dialog>
    </>
  );
}
