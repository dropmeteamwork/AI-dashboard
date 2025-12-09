import { THEME } from "@/components/dashboard/theme";

const FlaggedItemCard = ({ item }) => {
  const imageUrl = item.image_s3_key; // Use the full URL directly

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${THEME.border}`, background: THEME.cardBg }}
    >
      {/* Image */}
      <div className="h-48 bg-gray-100">
        <img
          src={imageUrl}
          alt={item.item}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-1">
        <span
          className={`text-xs px-2 py-1 rounded-full inline-block ${
            item.flag === "LOW_CONF"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.flag}
        </span>

        <h3 className="font-semibold capitalize">{item.item}</h3>

        <p className="text-sm text-muted">
          Confidence: {(item.confidence * 100).toFixed(0)}%
        </p>

        <p className="text-sm text-muted">
          Machine: {item.machine_name}
        </p>

        <p className="text-xs text-muted">
          {new Date(item.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default FlaggedItemCard;
