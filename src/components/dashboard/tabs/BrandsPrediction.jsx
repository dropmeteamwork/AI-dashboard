import React, { useState, useEffect, useMemo } from "react";

export default function BrandsTab() {
  const [brandPredictions, setBrandPredictions] = useState([]);
  const [search, setSearch] = useState("");

  const searchTerm = search.trim().toLowerCase();

  // - Fetch brand predictions -

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(
          "https://web-ai-dashboard.up.railway.app/ai_dashboard/brand-predictions/?page_size=1000"
        );
        const data = await res.json();
        const items = data.results || data;
        setBrandPredictions(items);
      } catch (err) {
        console.error("Error fetching brand predictions:", err);
      }
    };
    fetchBrands();
  }, []);

  // --- Group images by brand ---
  const brandsWithImages = useMemo(() => {
    const summary = {};
    brandPredictions.forEach((b) => {
      if (!summary[b.brand]) summary[b.brand] = [];
      summary[b.brand].push(b.image_url);
    });
    return Object.entries(summary)
      .map(([brand, images]) => ({ brand, images }))
      .filter((b) =>
        b.brand.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => b.images.length - a.images.length);
  }, [brandPredictions, searchTerm]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      {brandsWithImages.length === 0 ? (
        <div className="text-gray-500">No brands found.</div>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Brand</th>
              <th className="border p-2 text-left">Images</th>
            </tr>
          </thead>
          <tbody>
            {brandsWithImages.map((b, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2 font-medium">{b.brand}</td>
                <td className="border p-2 flex flex-wrap gap-2">
                  {b.images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={b.brand}
                      className="h-16 w-16 object-contain border rounded"
                    />
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

}
