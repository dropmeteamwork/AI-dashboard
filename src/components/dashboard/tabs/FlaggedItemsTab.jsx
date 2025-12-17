// FlaggedItemsTab.jsx
import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import SkeletonCard from "@/components/cards/SkeletonCard";
import FlaggedItemCard from "@/components/cards/FlaggedItemCard";
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, Filter, Check, X, FileDown, Image } from "lucide-react";
import { exportToCSV } from "@/utils/exportCsv";

const PAGE_SIZE = 12;

// Map flag codes to readable names
const getFlagLabel = (flag) => {
  const flagMap = {
    "FN": "False Negative",
    "FP": "False Positive",
    "LOW_CONF": "Low Confidence",
    "EDGE_CASE": "Edge Case",
  };
  return flagMap[flag] || flag;
};

// Get item filter button color based on item type
const getItemColor = (item) => {
  const colors = {
    "aluminum": "bg-blue-500",
    "plastic": "bg-green-500",
    "glass": "bg-purple-500",
    "paper": "bg-yellow-500",
    "other": "bg-gray-500",
  };
  return colors[item?.toLowerCase()] || "bg-gray-500";
};

const FlaggedItemsTab = () => {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(""); // Filter by item/class
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [updatingBrand, setUpdatingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

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

  // Get unique item classes from flagged items
  const availableItems = useMemo(() => {
    const itemSet = new Set(items.map(item => item.item).filter(Boolean));
    return Array.from(itemSet).sort();
  }, [items]);

  // Get unique brands from flagged items (for brand correction modal)
  const availableBrands = useMemo(() => {
    const brands = new Set(items.map(item => item.brand || item.machine_name).filter(Boolean));
    return Array.from(brands).sort();
  }, [items]);

  // Filter items by selected item class
  const filteredItems = useMemo(() => {
    if (!selectedItem) return items;
    return items.filter(item => item.item === selectedItem);
  }, [items, selectedItem]);

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
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, brand } : item
          )
        );
        setSelectedItemForEdit(null);
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

  const handleExportCSV = () => {
    exportToCSV(items, "flagged_items_report", [
      { key: "id", label: "ID" },
      { key: "item", label: "Prediction" },
      { key: "flag", label: "Flag Type" },
      { key: "confidence", label: "Confidence" },
      { key: "machine_name", label: "Machine" },
      { key: "created_at", label: "Timestamp" },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Flagged Items</h2>
            <Badge className="bg-red-100 text-red-700">{count}</Badge>
          </div>
          <p className="text-gray-600">Review flagged detections: picture + prediction + flag type + confidence</p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filter Card - Filter by Item/Class */}
      <Card className="p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter by Item Class</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedItem("")}
            className={`${
              selectedItem === ""
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
            size="sm"
          >
            All Items ({count})
          </Button>
          {availableItems.map((itemClass) => {
            const itemCount = items.filter(item => item.item === itemClass).length;
            return (
              <Button
                key={itemClass}
                onClick={() => setSelectedItem(itemClass)}
                className={`capitalize ${
                  selectedItem === itemClass
                    ? `${getItemColor(itemClass)} hover:opacity-90 text-white`
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
                size="sm"
              >
                {itemClass} ({itemCount})
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Items Grid - Cards Layout */}
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
                className="group relative cursor-pointer"
                onClick={() => setImagePreview(item)}
              >
                <FlaggedItemCard item={item} />
                {/* Hover Overlay with View Button */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-xl transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    className="bg-white hover:bg-gray-100 text-gray-900 gap-2 font-medium shadow-lg"
                    size="sm"
                  >
                    <Image className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              {selectedItem ? `No flagged items for "${selectedItem}"` : "No flagged items found"}
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
      <Dialog open={!!selectedItemForEdit} onOpenChange={(open) => !open && setSelectedItemForEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Correct Brand
            </DialogTitle>
          </DialogHeader>
          
          {selectedItemForEdit && (
            <div className="space-y-4">
              {/* Item Preview */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex gap-3">
                  <img
                    src={selectedItemForEdit.image_s3_key}
                    alt="Item"
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23e5e7eb' width='64' height='64'/%3E%3C/svg%3E";
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Current Prediction</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedItemForEdit.item}</p>
                    <Badge className={`mt-2 ${
                      selectedItemForEdit.flag === "LOW_CONF"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }`}>
                      {getFlagLabel(selectedItemForEdit.flag)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Brand Update Section */}
              <div className="space-y-4">
                {/* Available Brands */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-3 flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Popular</span>
                    Select from Known Brands
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                    {availableBrands.length > 0 ? (
                      availableBrands.map((brand) => (
                        <Button
                          key={brand}
                          onClick={() => setNewBrand(brand)}
                          className={`text-sm font-medium transition-all ${
                            newBrand === brand
                              ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                          }`}
                          size="sm"
                          variant="outline"
                        >
                          {brand}
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 col-span-2">No brands available</p>
                    )}
                  </div>
                </div>

                {/* Custom Brand Input */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-2 flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">Custom</span>
                    Or Enter a New Brand
                  </label>
                  <Input
                    type="text"
                    placeholder="Type a brand name..."
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">You can enter any brand name not in the list above</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    if (newBrand.trim()) {
                      updateItemBrand(selectedItemForEdit.id, newBrand.trim());
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
                    setSelectedItemForEdit(null);
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

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
          onClick={() => setImagePreview(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">Flagged Item Details</h3>
                <Badge className={`${
                  imagePreview.flag === "LOW_CONF"
                    ? "bg-yellow-500 text-white"
                    : imagePreview.flag === "FP"
                    ? "bg-orange-500 text-white"
                    : "bg-red-500 text-white"
                }`}>
                  {getFlagLabel(imagePreview.flag)}
                </Badge>
              </div>
              <button
                onClick={() => setImagePreview(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Image */}
            <div className="p-4">
              <img
                src={imagePreview.image_s3_key}
                alt={imagePreview.item}
                className="w-full h-auto max-h-96 object-contain rounded-lg bg-gray-100"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='system-ui' font-size='16' fill='%239ca3af'%3EImage not found%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Details */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Prediction</p>
                  <p className="font-bold text-lg text-gray-900 capitalize">{imagePreview.item}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Confidence</p>
                  <p className={`font-bold text-lg ${
                    imagePreview.confidence >= 0.8 ? "text-green-600" :
                    imagePreview.confidence >= 0.5 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {(imagePreview.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Machine</p>
                  <p className="font-medium text-gray-900">{(imagePreview.machine_name || "Unknown").replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Timestamp</p>
                  <p className="font-medium text-gray-900">
                    {new Date(imagePreview.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-gray-100">
                <Button
                  onClick={() => {
                    setSelectedItemForEdit(imagePreview);
                    setImagePreview(null);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <Check className="h-4 w-4" />
                  Correct This Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlaggedItemsTab;
