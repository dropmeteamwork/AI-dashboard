// FlaggedItemsTab.jsx
import { useEffect, useState } from "react";
import SkeletonCard from "@/components/cards/SkeletonCard";
import FlaggedItemCard from "@/components/cards/FlaggedItemCard";
import { THEME } from "@/components/dashboard/theme";

const PAGE_SIZE = 12;

const FlaggedItemsTab = () => {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchFlaggedItems = async () => {
    setLoading(true);
    const res = await fetch(
      `https://web-ai-dashboard.up.railway.app/ai_dashboard/flagged/?page=${page}`
    );
    const data = await res.json();
    setItems(data.results || []);
    setCount(data.count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlaggedItems();
  }, [page]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Flagged Items</h2>
      <p className="text-sm" style={{ color: THEME.muted }}>
        Detailed list of all flagged detections
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : items.map((item) => (
              <FlaggedItemCard key={item.id} item={item} />
            ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
        <span className="text-sm" style={{ color: THEME.muted }}>
          Page {page} of {Math.ceil(count / PAGE_SIZE)}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 rounded-lg border"
          >
            Previous
          </button>
          <button
            disabled={page * PAGE_SIZE >= count}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 rounded-lg border"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlaggedItemsTab;
