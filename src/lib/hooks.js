import { useEffect, useState, useCallback } from "react";
// Tải dữ liệu từ server 1 lần khi mount.
export function useServerData(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => { setLoading(true); Promise.resolve(loader()).then((d) => { setData(d); setLoading(false); }); }, deps); // eslint-disable-line
  useEffect(() => { let m = true; Promise.resolve(loader()).then((d) => { if (m) { setData(d); setLoading(false); } }); return () => { m = false; }; }, deps); // eslint-disable-line
  return { data, setData, loading, reload };
}
