import { useEffect, useRef, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const mq = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    mq.current = window.matchMedia(query);
    setMatches(mq.current.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.current.addEventListener("change", handler);
    return () => mq.current?.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
