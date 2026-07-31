"use client";

import { useEffect, useRef } from "react";

import { trackNoteRead } from "@/lib/api/pages";

type NoteReadTrackerProps = {
  slug: string;
  targetId: string;
};

export function NoteReadTracker({ slug, targetId }: NoteReadTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    const storageKey = `somto_note_read_${slug}`;

    const hasTracked =
      trackedRef.current || window.sessionStorage.getItem(storageKey) === "1";

    if (hasTracked) return;

    const onScroll = () => {
      if (trackedRef.current) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const noteTop = rect.top + window.scrollY;
      const noteHalfway = noteTop + target.offsetHeight * 0.5;
      const viewportBottom = window.scrollY + window.innerHeight;

      if (viewportBottom < noteHalfway) return;

      trackedRef.current = true;
      window.sessionStorage.setItem(storageKey, "1");
      void trackNoteRead(slug);
      window.removeEventListener("scroll", onScroll);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [slug, targetId]);

  return null;
}
