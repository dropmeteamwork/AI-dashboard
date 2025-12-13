import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COLORS } from "@/constants/colors";
import { BrandsPieChart, PerformanceRadarChart } from "../../charts/ChartsAnalytics";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  TrendingUp, 
  Calendar,
  Grid3x3,
  List,
  X,
  Loader2,
  Image as ImageIcon
} from "lucide-react";

export default function BrandsTab() {
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [brandPredictions, setBrandPredictions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const itemsPerPage = 16; // Number of images per page

  const searchTerm = search.trim().toLowerCase();

  // --- Fetch brand predictions ---
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://web-ai-dashboard.up.railway.app/ai_dashboard/brand-predictions/?page_size=1000"
        );
        const data = await res.json();
        const items = data.results || data;
        
        // Log first item to see data structure
        if (items && items.length > 0) {
          console.log("First item from API:", items[0]);
          console.log("Available fields:", Object.keys(items[0]));
        }
        
        setBrandPredictions(items);
      } catch (err) {
        console.error("Error fetching brand predictions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // --- Get unique brands summary with images ---
  const brandsSummary = useMemo(() => {
    const summary = {};
    let imageCount = 0;
    
    brandPredictions.forEach((b) => {
      if (!summary[b.brand]) {
        summary[b.brand] = {
          brand: b.brand,
          total: 0,
          last_seen: b.timestamp,
          firstSeen: b.timestamp,
          images: [],
        };
      }
      summary[b.brand].total += 1;
      
      // Store image URLs for later use - try multiple field names
      const imageUrl = b.image_url || b.image || b.image_s3_key;
      if (imageUrl) {
        summary[b.brand].images.push(imageUrl);
        imageCount++;
      } else {
        console.warn("No image field found on item:", { brand: b.brand, fields: Object.keys(b) });
      }
      
      if (new Date(b.timestamp) > new Date(summary[b.brand].last_seen)) {
        summary[b.brand].last_seen = b.timestamp;
      }
      if (new Date(b.timestamp) < new Date(summary[b.brand].firstSeen)) {
        summary[b.brand].firstSeen = b.timestamp;
      }
    });
    
    console.log("Brand Summary created:", { 
      totalBrands: Object.keys(summary).length, 
      totalImages: imageCount,
      brands: Object.keys(summary)
    });
    
    return Object.values(summary).sort((a, b) => b.total - a.total);
  }, [brandPredictions]);

  // --- Filter Brands ---
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brandsSummary;
    return brandsSummary.filter((b) =>
      b.brand.toLowerCase().includes(searchTerm)
    );
  }, [brandsSummary, searchTerm]);

  // --- Brand Stats ---
  const brandStats = useMemo(() => {
    if (!selectedBrand) return null;
    return brandsSummary.find((b) => b.brand === selectedBrand);
  }, [selectedBrand, brandsSummary]);

  // --- Brand Images - directly from predictions like BrandsPrediction ---
  const brandImages = useMemo(() => {
    if (!selectedBrand) return [];
    // Get all predictions for this brand with image URLs
    const images = brandPredictions
      .filter((b) => b.brand === selectedBrand)
      .map((b) => ({
        image_url: b.image_url || b.image || "",
      }));
    
    console.log(`${selectedBrand} has ${images.length} images`);
    if (images.length > 0) {
      console.log("First image URL:", images[0].image_url);
      console.log("Sample images:", images.slice(0, 3));
    }
    
    return images;
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
            <mark key={i} className="px-1 bg-yellow-300 font-semibold rounded">
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

  const totalDetections = brandsSummary.reduce((s, x) => s + x.total, 0);
  const brandShare = brandStats
    ? ((brandStats.total / totalDetections) * 100).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg p-6" style={{ background: `linear-gradient(90deg, ${COLORS.TINT_50}, ${COLORS.TINT_50})`, border: `1px solid ${COLORS.GREEN_BORDER}` }}>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Brand Insights</h2>
        <p className="text-gray-600">
          Explore {brandsSummary.length} brands with {totalDetections.toLocaleString()} total detections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Brands List Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border border-gray-200 overflow-hidden">
            {/* Search Header */}
            <div className="text-white p-4" style={{ backgroundColor: COLORS.PRIMARY }}>
              <div className="font-bold text-lg mb-3">Select Brand</div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-green-100" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-green-500 placeholder:text-green-100 text-white border-0"
                />
              </div>
            </div>

            {/* Brands List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-green-600" />
                </div>
              ) : filteredBrands.length === 0 ? (
                <div className="text-gray-500 text-sm p-4 text-center">No brands found</div>
              ) : (
                filteredBrands.map((b, idx) => (
                  <div
                    key={b.brand}
                    onClick={() => {
                      setSelectedBrand(b.brand);
                      setCurrentPage(1);
                    }}
                    className={`p-3 cursor-pointer transition flex justify-between items-center ${
                      selectedBrand === b.brand
                        ? "bg-green-600 text-white"
                        : idx === highlightIndex
                        ? "bg-green-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedBrand === b.brand ? "bg-white text-green-600" : "bg-green-100 text-green-700"
                      } font-bold text-sm flex-shrink-0`}>
                        {String(b.brand).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold truncate text-sm ${
                          selectedBrand === b.brand ? "text-white" : "text-gray-900"
                        }`}>
                          {highlightText(b.brand)}
                        </div>
                      </div>
                    </div>
                    <Badge className={`ml-2 flex-shrink-0 ${
                      selectedBrand === b.brand ? "bg-white text-green-600" : "bg-green-100 text-green-700"
                    }`}>
                      {b.total}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {selectedBrand && brandStats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Total Detections</span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-700">{brandStats.total}</div>
                  <div className="text-xs text-gray-500 mt-1">Items detected</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Market Share</span>
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-700">{brandShare}%</div>
                  <div className="text-xs text-gray-500 mt-1">Of all detections</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Last Seen</span>
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-sm font-bold text-purple-700">
                    {new Date(brandStats.last_seen).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(brandStats.last_seen).toLocaleTimeString()}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Export</span>
                    <Download className="h-4 w-4 text-orange-600" />
                  </div>
                  <Button className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white text-xs">
                    Download CSV
                  </Button>
                </div>
              </div>

              {/* Images Section */}
              {brandImages.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{brandStats.brand} Detections</h3>
                      <p className="text-sm text-gray-500">{brandImages.length} images total</p>
                    </div>
                    <div className="flex gap-2 border rounded-lg p-1 bg-gray-50">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded transition ${
                          viewMode === "grid"
                            ? "bg-green-600 text-white"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded transition ${
                          viewMode === "list"
                            ? "bg-green-600 text-white"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Image Grid - Using DIV for better display */}
                  <div className={`grid gap-2 ${
                    viewMode === "grid" 
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" 
                      : "grid-cols-1"
                  }`}>
                    {paginatedImages.length === 0 ? (
                      <div className="col-span-full flex items-center justify-center py-12">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No images found</p>
                        </div>
                      </div>
                    ) : (
                      paginatedImages.map((img, i) => {
                        const imageUrl = img.image_url || "";
                        const globalIndex = (currentPage - 1) * itemsPerPage + i;
                        
                        return (
                          <div
                            key={`${selectedBrand}-${globalIndex}`}
                            onClick={() => {
                              if (imageUrl) {
                                setModalImage(imageUrl);
                                setModalImageIndex(globalIndex);
                              }
                            }}
                            className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer bg-white"
                          >
                            <div className="relative w-full h-40 bg-white flex items-center justify-center">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={`${selectedBrand}-${i}`}
                                  style={{
                                    maxHeight: '160px',
                                    maxWidth: '100%',
                                    width: 'auto',
                                    height: 'auto'
                                  }}
                                  onError={(e) => {
                                    console.error("Image load error:", imageUrl);
                                  }}
                                  onLoad={(e) => {
                                    console.log("Image loaded successfully:", imageUrl);
                                  }}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                                  <ImageIcon className="h-8 w-8" />
                                  <span className="text-xs">No URL</span>
                                </div>
                              )}
                            </div>
                            <div className="p-2 text-xs text-gray-600 text-center border-t">
                              Image {globalIndex + 1}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, brandImages.length)} of {brandImages.length}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                        >
                          <ChevronLeft className="h-4 w-4" />
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
                              <Button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                size="sm"
                                className={
                                  currentPage === pageNum
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                                }
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                          }
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No images found for this brand</p>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-3 flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <Eye className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg font-medium">Select a brand to view details</p>
                <p className="text-gray-400 text-sm mt-1">Choose from the list on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Brand Analytics */}
      {selectedBrand && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Market Distribution</h3>
            <div style={{ height: 320 }}>
              <BrandsPieChart data={brandsSummary} top={8} />
            </div>
          </Card>

          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Comparison</h3>
            <div style={{ height: 320 }}>
              <PerformanceRadarChart data={brandsSummary} />
            </div>
          </Card>
        </div>
      )}

      {/* Image Modal */}
      <Dialog open={!!modalImage} onOpenChange={(open) => !open && setModalImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedBrand} - Image {modalImageIndex + 1} of {brandImages.length}
            </DialogTitle>
          </DialogHeader>
          
          {modalImage && (
            <div className="space-y-4">
              <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden h-96">
                <img
                  src={modalImage}
                  alt="Full view"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => {
                    const newIndex = Math.max(0, modalImageIndex - 1);
                    setModalImageIndex(newIndex);
                    setModalImage(brandImages[newIndex]?.image_url || modalImage);
                  }}
                  disabled={modalImageIndex === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    const newIndex = Math.min(brandImages.length - 1, modalImageIndex + 1);
                    setModalImageIndex(newIndex);
                    setModalImage(brandImages[newIndex]?.image_url || modalImage);
                  }}
                  disabled={modalImageIndex === brandImages.length - 1}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
