import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function useCollection(entityName, query = {}, options) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryKey = JSON.stringify(query);
  const optionsKey = JSON.stringify(options || { sort: "-created_date", limit: 200 });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.entities[entityName].filter(
        JSON.parse(queryKey),
        JSON.parse(optionsKey)
      );
      setItems(Array.isArray(res) ? res : res?.items ?? []);
    } catch (err) {
      setError(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [entityName, queryKey, optionsKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}