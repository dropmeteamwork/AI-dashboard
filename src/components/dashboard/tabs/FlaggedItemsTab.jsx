// FlaggedItemsTab.jsx
import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import SkeletonCard from "@/components/cards/SkeletonCard";
import FlaggedItemCard from "@/components/cards/FlaggedItemCard";
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, Filter, Check, X } from "lucide-react";

const PAGE_SIZE = 12;

const FlaggedItemsTab = () => {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatingBrand, setUpdatingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState("");

  const fetchFlaggedItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://web-ai-dashboard.up.railway.app/ai_dashboard/flagged/?page=${page}`
      );
      const data = await res.json();
      setItems(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      console.error("Error fetching flagged items:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique brands from flagged items
  const availableBrands = useMemo(() => {
    const brands = new Set(items.map(item => item.brand || item.item).filter(Boolean));
    return Array.from(brands).sort();
  }, [items]);

  // Filter items by selected brand
  const filteredItems = useMemo(() => {
    if (!selectedBrand) return items;
    return items.filter(item => (item.brand || item.item) === selectedBrand);
  }, [items, selectedBrand]);

  // Update brand for a flagged item
  const updateItemBrand = async (itemId, brand) => {
    setUpdatingBrand(true);
    try {
      const res = await fetch(
        `https://web-ai-dashboard.up.railway.app/ai_dashboard/flagged/${itemId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand }),
        }
      );
      
      if (res.ok) {
        // Update local state
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, brand } : item
          )
        );
        setSelectedItem(null);
      } else {
        alert("Failed to update brand");
      }
    } catch (err) {
      console.error("Error updating brand:", err);
      alert("Error updating brand");
    } finally {
      setUpdatingBrand(false);
    }
  };

  useEffect(() => {
    fetchFlaggedItems();
  }, [page]);

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const displayCount = filteredItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Flagged Items</h2>
          <Badge className="bg-red-100 text-red-700">{count}</Badge>
        </div>
        <p className="text-gray-600">Review and manage all flagged detections that need attention</p>
      </div>

      {/* Filter Card */}
      <Card className="p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter by Brand</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedBrand("")}
            className={`${
              selectedBrand === ""
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
            size="sm"
          >
            All Items ({count})
          </Button>
          {availableBrands.map((brand) => {
            const brandCount = items.filter(item => (item.brand || item.item) === brand).length;
            return (
              <Button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`${
                  selectedBrand === brand
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
                size="sm"
                variant={selectedBrand === brand ? "default" : "outline"}
              >
                {brand} ({brandCount})
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Items Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="cursor-pointer"
              >
                <FlaggedItemCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              {selectedBrand ? `No flagged items for ${selectedBrand}` : "No flagged items found"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages} ({count} total items)
          </span>

          <div className="flex gap-2">
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Update Brand Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Brand</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {/* Item Preview */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex gap-3">
                  <img
                    src={selectedItem.image_s3_key}
                    alt="Item"
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23e5e7eb' width='64' height='64'/%3E%3C/svg%3E";
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Current Brand</p>
                    <p className="font-semibold text-gray-900">{selectedItem.brand || selectedItem.item}</p>
                    <Badge className={`mt-2 ${
                      selectedItem.flag === "LOW_CONF"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {selectedItem.flag}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Brand Update Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Select New Brand</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableBrands.map((brand) => (
                    <Button
                      key={brand}
                      onClick={() => {
                        setNewBrand(brand);
                      }}
                      className={`w-full text-left justify-start ${
                        newBrand === brand
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                      }`}
                      variant="outline"
                    >
                      {brand}
                    </Button>
                  ))}
                </div>

                {/* Custom Brand Input */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Or Enter New Brand</label>
                  <Input
                    type="text"
                    placeholder="Type a brand name..."
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    if (newBrand.trim()) {
                      updateItemBrand(selectedItem.id, newBrand.trim());
                      setNewBrand("");
                    }
                  }}
                  disabled={!newBrand.trim() || updatingBrand}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  {updatingBrand ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedItem(null);
                    setNewBrand("");
                  }}
                  disabled={updatingBrand}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlaggedItemsTab;
