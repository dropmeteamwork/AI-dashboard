// utils.js

export const formatDateShort = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export const fetchJson = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
};

// Professional styling presets
export const professionalStyles = {
  card: {
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)",
    padding: "20px",
    transition: "all 0.2s ease",
  },
  cardHover: {
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)",
    borderColor: "#d1d5db",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "16px",
  },
  subheading: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "12px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  gridGap: "16px",
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
};
