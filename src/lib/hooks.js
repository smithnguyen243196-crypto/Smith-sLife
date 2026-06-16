import { useEffect, useState, useCallback } from "react";

// Tải dữ liệu từ server 1 lần khi mount.
export function useServerData(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => { setLoading(true); Promise.resolve(loader()).then((d) => { setData(d); setLoading(false); }); }, deps); // eslint-disable-line
  useEffect(() => { let m = true; Promise.resolve(loader()).then((d) => { if (m) { setData(d); setLoading(false); } }); return () => { m = false; }; }, deps); // eslint-disable-line
  return { data, setData, loading, reload };
}

// Theo dõi media query (đổi bố cục desktop <-> mobile).
export function useMediaQuery(query) {
  const get = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false);
  const [match, setMatch] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on));
  }, [query]);
  return match;
}
