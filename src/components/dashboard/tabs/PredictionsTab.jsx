import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Flag,
  MessageSquare,
  Filter,
  RefreshCw,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const API_BASE = "https://web-ai-dashboard.up.railway.app";

// Helper to format date safely
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "—";
  }
};

// Helper to get image URL from prediction
const getImageUrl = (pred) => {
  // Check for direct image URLs first (if backend provides full URLs)
  if (pred.image_url) return pred.image_url;
  if (pred.image_path) return pred.image_path;
  if (pred.prediction_image) return pred.prediction_image;
  
  // Construct S3 URL from image_s3_key
  // The S3 bucket is: ai-data-001.s3.eu-central-1.amazonaws.com
  if (pred.image_s3_key) {
    return `https://ai-data-001.s3.eu-central-1.amazonaws.com/${pred.image_s3_key}`;
  }
  
  return null;
};

const PredictionsTab = () => {
  // Cache all data and paginate client-side
  const [allPredictions, setAllPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");

  // Flag states
  const [flaggedItems, setFlaggedItems] = useState(new Set());
  const [flagTypeOpen, setFlagTypeOpen] = useState(new Set());
  const [commentOpen, setCommentOpen] = useState(new Set());
  const [selectedEdgeCase, setSelectedEdgeCase] = useState(new Set());
  const [comments, setComments] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch all predictions once
  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/ai_dashboard/predictions/`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      
      // Handle paginated response format or plain array
      if (data.results && Array.isArray(data.results)) {
        setAllPredictions(data.results);
      } else if (Array.isArray(data)) {
        setAllPredictions(data);
      } else {
        setAllPredictions([]);
      }
    } catch (err) {
      console.error("Failed to fetch predictions:", err);
      setError(err.message);
      setAllPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch only once on mount
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchPredictions();
    }
  }, []);

  // Computed values
  const totalCount = allPredictions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Get current page's predictions
  const predictions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return allPredictions.slice(startIndex, startIndex + pageSize);
  }, [allPredictions, currentPage, pageSize]);

  // Apply client-side filters to current page data
  const filteredPredictions = useMemo(() => {
    let filtered = [...predictions];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.item?.toLowerCase().includes(term) ||
          p.machine_name?.toLowerCase().includes(term) ||
          p.id?.toString().includes(term)
      );
    }

    // Class filter
    if (classFilter !== "all") {
      filtered = filtered.filter((p) => p.item === classFilter);
    }

    // Confidence filter
    if (confidenceFilter !== "all") {
      const conf = (p) => {
        const c = (p.confidence ?? 0) * 100;
        if (confidenceFilter === "high") return c >= 80;
        if (confidenceFilter === "medium") return 50 <= c && c < 80;
        if (confidenceFilter === "low") return c < 50;
        return true;
      };
      filtered = filtered.filter(conf);
    }

    return filtered;
  }, [predictions, searchTerm, classFilter, confidenceFilter]);

  // Toggle flag
  const toggleFlag = (id) => {
    const newFlagged = new Set(flaggedItems);
    if (newFlagged.has(id)) {
      newFlagged.delete(id);
    } else {
      newFlagged.add(id);
    }
    setFlaggedItems(newFlagged);
  };

  // Enable flag type when flag is pressed
  const handleFlagClick = (id) => {
    toggleFlag(id);
    if (flaggedItems.has(id)) {
      setFlagTypeOpen(new Set(flagTypeOpen).add(id));
    }
  };

  // Enable comment when edge case is selected
  const handleEdgeCaseSelect = (id, isEdgeCase) => {
    const newEdgeCases = new Set(selectedEdgeCase);
    if (isEdgeCase) {
      newEdgeCases.add(id);
      setCommentOpen(new Set(commentOpen).add(id));
    } else {
      newEdgeCases.delete(id);
      setCommentOpen(new Set(commentOpen).delete(id));
    }
    setSelectedEdgeCase(newEdgeCases);
  };

  // Export predictions
  const exportPredictions = () => {
    const header = "id,class,brand,confidence,flag_type,comment,timestamp\n";
    const rows = filteredPredictions
      .map(
        (p) =>
          `${p.id},"${p.class}","${p.brand}",${p.confidence},"${flagTypeOpen.has(p.id) ? "flagged" : ""}","${comments[p.id] || ""}",${p.timestamp}`
      )
      .join("\n");

    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "predictions_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Predictions</h2>
          <p className="text-sm text-gray-600">
            Showing {predictions.length} of {totalCount.toLocaleString()} • Page {currentPage}/{totalPages}
          </p>
        </div>
        <Button
          onClick={() => { hasFetched.current = false; fetchPredictions(); }}
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">Error loading predictions: {error}</p>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <p className="text-sm text-blue-700">Loading predictions...</p>
        </div>
      )}

      {/* Filters - Responsive */}
      <Card className="p-4 sm:p-6 border border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by class, brand, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:border-gray-400 transition"
            >
              <option value="all">All Classes</option>
              <option value="plastic">Plastic</option>
              <option value="aluminum">Aluminum</option>
              <option value="other">Other</option>
              <option value="hand">Hand</option>
            </select>

            {/* Confidence Filter */}
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:border-gray-400 transition"
            >
              <option value="all">All Confidence</option>
              <option value="high">High (80% and above)</option>
              <option value="medium">Medium (50-80%)</option>
              <option value="low">Low (below 50%)</option>
            </select>
          </div>

          {/* Active Filters */}
          {(searchTerm || classFilter !== "all" || confidenceFilter !== "all") && (
            <div className="flex gap-2 flex-wrap pt-2">
              {searchTerm && (
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  Search: {searchTerm}
                </Badge>
              )}
              {classFilter !== "all" && (
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  Class: {classFilter}
                </Badge>
              )}
              {confidenceFilter !== "all" && (
                <Badge className="bg-amber-100 text-amber-800 px-3 py-1">
                  Confidence: {confidenceFilter}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Predictions Table - Responsive with horizontal scroll */}
      <Card className="border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Predictions ({filteredPredictions.length})</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Page {currentPage} / {totalPages} • {totalCount.toLocaleString()} total
            </p>
          </div>
          <Button
            onClick={exportPredictions}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="overflow-x-auto scroll-x-mobile">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Image</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Class</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Brand</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700">Confidence</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Flag</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Flag Type</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Comment</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPredictions.map((pred, idx) => (
                <tr
                  key={pred.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-gray-900 font-medium">{pred.id}</td>
                  <td className="px-6 py-4">
                    {getImageUrl(pred) ? (
                      <button
                        onClick={() => setImagePreview(getImageUrl(pred))}
                        className="relative group"
                      >
                        <img
                          src={getImageUrl(pred)}
                          alt={`Prediction ${pred.id}`}
                          className="h-12 w-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23e5e7eb' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='system-ui' font-size='12' fill='%239ca3af'%3ENo image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                          Click to view
                        </div>
                      </button>
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">No img</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-purple-100 text-purple-800">
                      {pred.item || pred.class || "—"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{pred.machine_name || pred.brand || "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-semibold ${
                        (pred.confidence ?? 0) >= 0.8
                          ? "text-green-600"
                          : (pred.confidence ?? 0) >= 0.5
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {Math.round((pred.confidence ?? 0) * 100)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleFlagClick(pred.id)}
                      className={`p-2 rounded-lg transition ${
                        flaggedItems.has(pred.id)
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title="Flag this prediction"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      disabled={!flaggedItems.has(pred.id)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      onChange={(e) => {
                        if (e.target.value === "edge_case") {
                          handleEdgeCaseSelect(pred.id, true);
                        } else {
                          handleEdgeCaseSelect(pred.id, false);
                        }
                      }}
                    >
                      <option value="">Select flag type...</option>
                      <option value="low_confidence">Low Confidence</option>
                      <option value="false_positive">False Positive (FP)</option>
                      <option value="false_negative">False Negative (FN)</option>
                      <option value="edge_case">Edge Case</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {selectedEdgeCase.has(pred.id) && (
                      <button
                        onClick={() => setCommentOpen(new Set(commentOpen).has(pred.id) ? new Set(Array.from(commentOpen).filter(id => id !== pred.id)) : new Set([...commentOpen, pred.id]))}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        title="Add comment"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(pred.timestamp || pred.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPredictions.length === 0 && (
          <div className="p-12 text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-semibold">No predictions available</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || classFilter !== "all" || confidenceFilter !== "all"
                ? "No predictions match your filters"
                : "Predictions will appear here once they are generated"}
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalCount > 0 && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold">{currentPage}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>{" "}
              ({totalCount} total predictions)
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Comment Modal/Inline - could be expanded to a proper modal */}
      {Array.from(commentOpen).map((id) => (
        <Card key={id} className="p-4 bg-blue-50 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-2">Add Comment for Prediction {id}</h4>
          <textarea
            value={comments[id] || ""}
            onChange={(e) => setComments({ ...comments, [id]: e.target.value })}
            placeholder="Add your comment here..."
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            rows="3"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => setCommentOpen(new Set(Array.from(commentOpen).filter(cid => cid !== id)))}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Save Comment
            </Button>
          </div>
        </Card>
      ))}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setImagePreview(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
              <button
                onClick={() => setImagePreview(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-auto"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='system-ui' font-size='16' fill='%239ca3af'%3EImage not found%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionsTab;
