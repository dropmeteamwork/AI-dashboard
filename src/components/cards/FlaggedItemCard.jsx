import { THEME } from "@/components/dashboard/theme";

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

// Get flag color based on type
const getFlagColor = (flag) => {
  switch (flag) {
    case "FN":
      return "bg-red-500 text-white";
    case "FP":
      return "bg-orange-500 text-white";
    case "LOW_CONF":
      return "bg-yellow-500 text-white";
    case "EDGE_CASE":
      return "bg-purple-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

// Get confidence color
const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return "text-green-600";
  if (confidence >= 0.5) return "text-amber-600";
  return "text-red-600";
};

const FlaggedItemCard = ({ item }) => {
  const imageUrl = item.image_s3_key;

  return (
    <div
      className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ border: `1px solid ${THEME.border}`, background: THEME.cardBg }}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={imageUrl}
          alt={item.item}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='system-ui' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
          }}
        />
        {/* Flag Badge - Top Right */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getFlagColor(item.flag)}`}>
            {getFlagLabel(item.flag)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Prediction/Item Class */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Prediction</p>
          <h3 className="font-bold text-lg text-gray-900 capitalize">{item.item}</h3>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Confidence</p>
          <span className={`font-bold text-lg ${getConfidenceColor(item.confidence)}`}>
            {(item.confidence * 100).toFixed(0)}%
          </span>
        </div>

        {/* Machine */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">Machine</p>
          <span className="font-medium text-gray-900">{(item.machine_name || "Unknown").replace(/_/g, " ")}</span>
        </div>

        {/* Timestamp */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {new Date(item.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlaggedItemCard;
