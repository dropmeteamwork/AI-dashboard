import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { BrandsPieChart } from "../../charts/ChartsAnalytics";

export default function BrandsTab() {
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [brandPredictions, setBrandPredictions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Number of images per page

  const searchTerm = search.trim().toLowerCase();

  // --- Fetch brand predictions ---
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

  // --- Get unique brands summary ---
  const brandsSummary = useMemo(() => {
    const summary = {};
    brandPredictions.forEach((b) => {
      if (!summary[b.brand]) {
        summary[b.brand] = {
          brand: b.brand,
          total: 0,
          last_seen: b.timestamp,
        };
      }
      summary[b.brand].total += 1;
      if (new Date(b.timestamp) > new Date(summary[b.brand].last_seen)) {
        summary[b.brand].last_seen = b.timestamp;
      }
    });
    return Object.values(summary).sort((a, b) => b.total - a.total);
  }, [brandPredictions]);

  // --- Filter Brands ---
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brandsSummary.slice(0, 12);
    return brandsSummary.filter((b) =>
      b.brand.toLowerCase().includes(searchTerm)
    );
  }, [brandsSummary, searchTerm]);

  // --- Brand Stats ---
  const brandStats = useMemo(() => {
    if (!selectedBrand) return null;
    return brandsSummary.find((b) => b.brand === selectedBrand);
  }, [selectedBrand, brandsSummary]);

  // --- Brand Images ---
  const brandImages = useMemo(() => {
    if (!selectedBrand) return [];
    return brandPredictions.filter((b) => b.brand === selectedBrand);
  }, [selectedBrand, brandPredictions]);

  // --- Pagination ---
  const totalPages = Math.ceil(brandImages.length / itemsPerPage);
  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return brandImages.slice(start, start + itemsPerPage);
  }, [brandImages, currentPage]);

  // --- Highlight Text ---
  const highlightText = (text) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return (
      <>
        {parts.map((p, i) =>
          p.toLowerCase() === searchTerm ? (
            <mark key={i} className="px-0.5 bg-yellow-200">
              {p}
            </mark>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </>
    );
  };

  // --- Keyboard Navigation ---
  const handleKeyDown = useCallback(
    (e) => {
      if (!filteredBrands.length) return;

      if (e.key === "ArrowDown") {
        setHighlightIndex((prev) =>
          prev + 1 === filteredBrands.length ? 0 : prev + 1
        );
      }

      if (e.key === "ArrowUp") {
        setHighlightIndex((prev) =>
          prev === 0 ? filteredBrands.length - 1 : prev - 1
        );
      }

      if (e.key === "Enter") {
        setSelectedBrand(filteredBrands[highlightIndex].brand);
      }
    },
    [filteredBrands, highlightIndex]
  );

  useEffect(() => {
    setHighlightIndex(0);
    setCurrentPage(1); // Reset page when search changes
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Search + Dropdown */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="font-semibold text-lg">Select a Brand</div>

          {selectedBrand && (
            <Button
              variant="outline"
              onClick={() => setSelectedBrand(null)}
              className="text-sm"
            >
              Clear Selection
            </Button>
          )}
        </div>

        <Input
          placeholder="Search brand..."
          value={search}
          onKeyDown={handleKeyDown}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        <div className="max-h-64 overflow-auto border rounded bg-white divide-y">
          {filteredBrands.length === 0 && (
            <div className="text-gray-500 text-sm p-2">No brands found</div>
          )}

          {filteredBrands.map((b, idx) => (
            <div
              key={b.brand}
              onClick={() => setSelectedBrand(b.brand)}
              className={`p-2 cursor-pointer flex justify-between items-center ${
                selectedBrand === b.brand
                  ? "bg-blue-600 text-white"
                  : idx === highlightIndex
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="font-medium">{highlightText(b.brand)}</div>
              <div className="text-xs text-gray-500">{b.total} detections</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Brand Insights */}
      {selectedBrand && brandStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Detections</div>
            <div className="text-2xl font-bold">{brandStats.total}</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-600">Share of All Brands</div>
            <div className="text-xl font-bold">
              {(
                (brandStats.total /
                  brandsSummary.reduce((s, x) => s + x.total, 0)) *
                100
              ).toFixed(2)}
              %
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-600">Last Seen</div>
            <div className="text-lg font-semibold">
              {new Date(brandStats.last_seen).toLocaleString()}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-600">Export Data</div>
            <Button className="mt-2 w-full">Export CSV</Button>
          </Card>
        </div>
      )}

      {/* Brand Images with Pagination */}
      {selectedBrand && paginatedImages.length > 0 && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedImages.map((b, i) => (
              <Card
                key={i}
                className="overflow-hidden flex items-center justify-center bg-gray-50 p-2"
              >
                <img
                  src={b.image_url}
                  alt={b.brand}
                  className="max-h-40 object-contain"
                />
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Brand Share Pie Chart */}
      {selectedBrand && (
        <Card className="p-4">
          <div className="font-semibold mb-2">Brand Share (All Time)</div>
          <div style={{ height: 360 }}>
            <BrandsPieChart data={brandsSummary} />
          </div>
        </Card>
      )}
    </div>
  );
}
