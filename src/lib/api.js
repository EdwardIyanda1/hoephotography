import { useEffect, useState, useCallback } from "react";
export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(data.error || "Request failed"), {
      status: response.status,
    });
  return data;
}
export function useApi(path) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((n) => n + 1), []);
  useEffect(() => {
    let alive = true;
    api(path)
      .then((data) => alive && setState({ path, data, loading: false, error: null }))
      .catch(
        (error) => alive && setState({ path, data: null, loading: false, error }),
      );
    return () => {
      alive = false;
    };
  }, [path, revision]);
  return state.path === path ? { ...state, reload } : { data: null, loading: true, error: null, reload };
}
export function money(amount, currency = "NGN") {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
    }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
}
