import { useEffect } from "react";

const DEFAULT_TITLE = "Worker — Find Jobs and Hire Worldwide";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Worker` : DEFAULT_TITLE;
  }, [title]);
}
