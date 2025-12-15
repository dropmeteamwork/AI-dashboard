import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Flag,
  MessageSquare,
  Filter,
  Eye,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_BASE = "https://web-ai-dashboard.up.railway.app";

const PredictionsTab = () => {
  const [allPredictions, setAllPredictions] = useState([]); // Cache all data
  const [predictions, setPredictions] = useState([]);
  const [seenPredictions, setSeenPredictions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [classFilter, setClassFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Flag states
  const [flaggedItems, setFlaggedItems] = useState(new Set());
  const [flagTypeOpen, setFlagTypeOpen] = useState(new Set());
  const [commentOpen, setCommentOpen] = useState(new Set());
  const [selectedEdgeCase, setSelectedEdgeCase] = useState(new Set());
  const [comments, setComments] = useState({});

  // Fetch all predictions once on mount
  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/ai_dashboard/predictions/`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        
        // Handle paginated response format (Django REST Framework style)
        if (data.results && typeof data.count === 'number') {
          // Server returned paginated data
          setAllPredictions(data.results);
          setPredictions(data.results.slice(0, pageSize));
          setTotalCount(data.count);
          setTotalPages(Math.ceil(data.count / pageSize));
        } else if (Array.isArray(data)) {
          // Backend returned all data as array - use client-side pagination
          // Limit to 500 items for better performance
          const limitedData = data.slice(0, 500);
          setAllPredictions(limitedData);
          setPredictions(limitedData.slice(0, pageSize));
          setTotalCount(limitedData.length);
          setTotalPages(Math.ceil(limitedData.length / pageSize));
        }
      } catch (err) {
        console.error("Failed to fetch predictions:", err);
        setError(err.message);
        setAllPredictions([]);
        setPredictions([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  // Paginate the cached data when page changes
  useEffect(() => {
    if (allPredictions.length > 0) {
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedData = allPredictions.slice(startIndex, startIndex + pageSize);
      setPredictions(paginatedData);
    }
  }, [currentPage, allPredictions]);

  // Separate new and seen predictions
  const { newPredictions, oldPredictions } = useMemo(() => {
    const newPreds = predictions.filter((p) => !seenPredictions.has(p.id));
    const oldPreds = predictions.filter((p) => seenPredictions.has(p.id));
    return { newPredictions: newPreds, oldPredictions: oldPreds };
  }, [predictions, seenPredictions]);

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

  // Mark as seen
  const markAsSeen = () => {
    const newSeenIds = new Set(seenPredictions);
    newPredictions.forEach((p) => newSeenIds.add(p.id));
    setSeenPredictions(newSeenIds);
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Predictions</h2>
        <p className="text-gray-600">Browse, filter, and manage all predictions with flagging and commenting options</p>
      </div>

      {/* Loading indicator - doesn't block UI */}
      {loading && predictions.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <p className="text-sm text-blue-700">Loading predictions...</p>
        </div>
      )}

      {/* New Predictions Alert */}
      {newPredictions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">{newPredictions.length} New Predictions</p>
              <p className="text-sm text-blue-700">New predictions are shown separately</p>
            </div>
          </div>
          <Button
            onClick={markAsSeen}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Mark as Seen
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6 border border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Predictions Table */}
      <Card className="border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Predictions ({filteredPredictions.length})</h3>
            <p className="text-sm text-gray-600 mt-1">
              {newPredictions.length} new • {oldPredictions.length} seen
            </p>
          </div>
          <Button
            onClick={exportPredictions}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left font-semibold text-gray-700">ID</th>
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
                  className={`hover:bg-gray-50 transition ${
                    !seenPredictions.has(pred.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-gray-900 font-medium">{pred.id}</td>
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
                    {pred.timestamp
                      ? new Date(pred.timestamp).toLocaleDateString()
                      : "—"}
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
    </div>
  );
};

export default PredictionsTab;
