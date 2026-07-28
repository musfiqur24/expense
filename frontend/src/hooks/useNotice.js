import { useCallback, useEffect, useState } from "react";

export function useNotice() {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const showNotice = useCallback((message, tone = "success") => {
    setNotice({ message, tone, id: Date.now() });
  }, []);

  return { notice, showNotice, clearNotice: () => setNotice(null) };
}
