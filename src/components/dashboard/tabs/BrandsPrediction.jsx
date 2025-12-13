import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Grid, List, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { COLORS } from "@/constants/colors";

const API_BASE = "https://web-ai-dashboard.up.railway.app";

export default function BrandsPrediction() {
  const [brandPredictions, setBrandPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("count");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const itemsPerPage = 12;

  // Fetch brand predictions
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${API_BASE}/ai_dashboard/brand-predictions/`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setBrandPredictions(data);
        } else if (data.results) {
          setBrandPredictions(data.results);
        }
      } catch (error) {
        console.error("Error fetching brand predictions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Group images by brand
  const brandsWithImages = useMemo(() => {
    const grouped = {};

    brandPredictions.forEach((item) => {
      const brand = item.brand || "Unknown";
      if (!grouped[brand]) {
        grouped[brand] = [];
      }
      if (item.image_url) {
        grouped[brand].push(item.image_url);
      }
    });

    return Object.entries(grouped)
      .filter(([brand]) => brand.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(([brand, images]) => ({
        brand,
        images,
        count: images.length,
      }))
      .sort((a, b) => {
        if (sortBy === "count") {
          return b.count - a.count;
        } else {
          return a.brand.localeCompare(b.brand);
        }
      });
  }, [brandPredictions, searchTerm, sortBy]);

  // Pagination
  const totalPages = Math.ceil(brandsWithImages.length / itemsPerPage);
  const paginatedBrands = brandsWithImages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field) => {
    setSortBy(field);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.PRIMARY }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLORS.PRIMARY }}>
              {brandsWithImages.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLORS.PRIMARY }}>
              {brandPredictions.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. per Brand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: COLORS.PRIMARY }}>
              {brandsWithImages.length > 0 ? Math.round(brandPredictions.length / brandsWithImages.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          {/* Sort & View Controls */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={sortBy === "count" ? "default" : "outline"}
                onClick={() => toggleSort("count")}
                style={sortBy === "count" ? { backgroundColor: COLORS.PRIMARY } : {}}
              >
                Sort by Count
              </Button>
              <Button
                size="sm"
                variant={sortBy === "alpha" ? "default" : "outline"}
                onClick={() => toggleSort("alpha")}
                style={sortBy === "alpha" ? { backgroundColor: COLORS.PRIMARY } : {}}
              >
                Sort Alphabetically
              </Button>
            </div>

            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
                style={viewMode === "grid" ? { backgroundColor: COLORS.PRIMARY } : {}}
                className="w-10 h-10 p-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "table" ? "default" : "ghost"}
                onClick={() => setViewMode("table")}
                style={viewMode === "table" ? { backgroundColor: COLORS.PRIMARY } : {}}
                className="w-10 h-10 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedBrands.map((item) => (
            <Card key={item.brand} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.brand}</CardTitle>
                  <Badge style={{ backgroundColor: COLORS.PRIMARY, color: "white" }}>
                    {item.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {item.images.length > 0 && (
                  <div className="relative mb-4 rounded-lg overflow-hidden h-48 bg-gray-100">
                    <img
                      src={item.images[0]}
                      alt={item.brand}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Button
                  className="w-full text-white"
                  style={{ backgroundColor: COLORS.PRIMARY }}
                  onClick={() => setSelectedBrand(item)}
                >
                  View All Images
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: `${COLORS.PRIMARY}10` }}>
                  <th className="text-left p-4 font-semibold">Brand</th>
                  <th className="text-left p-4 font-semibold">Count</th>
                  <th className="text-left p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBrands.map((item) => (
                  <tr key={item.brand} className="border-t hover:bg-gray-50">
                    <td className="p-4">{item.brand}</td>
                    <td className="p-4">
                      <Badge style={{ backgroundColor: COLORS.PRIMARY, color: "white" }}>
                        {item.count}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        style={{ backgroundColor: COLORS.PRIMARY, color: "white" }}
                        onClick={() => setSelectedBrand(item)}
                      >
                        View Images
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Image Gallery Modal */}
      {selectedBrand && (
        <Dialog
          open={!!selectedBrand}
          onOpenChange={() => {
            setSelectedBrand(null);
            setSelectedImageIndex(0);
          }}
        >
          <DialogContent className="max-w-4xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedBrand.brand}</h2>
                <X
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => {
                    setSelectedBrand(null);
                    setSelectedImageIndex(0);
                  }}
                />
              </div>

              {/* Main Image */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden h-96">
                <img
                  src={selectedBrand.images[selectedImageIndex]}
                  alt={`${selectedBrand.brand} - ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-white text-sm"
                  style={{ backgroundColor: COLORS.PRIMARY }}
                >
                  {selectedImageIndex + 1} / {selectedBrand.images.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedBrand.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className="flex-shrink-0 rounded-lg overflow-hidden border-2"
                    style={{
                      borderColor:
                        selectedImageIndex === index ? COLORS.PRIMARY : "transparent",
                    }}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-20 h-20 object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() =>
                    setSelectedImageIndex(
                      selectedImageIndex === 0
                        ? selectedBrand.images.length - 1
                        : selectedImageIndex - 1
                    )
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setSelectedImageIndex(
                      selectedImageIndex === selectedBrand.images.length - 1
                        ? 0
                        : selectedImageIndex + 1
                    )
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
