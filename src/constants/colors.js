// Brand Color Palette - All using bright green from login button
export const COLORS = {
  PRIMARY: "#6CC04A",      // Bright green - main brand color
  DARK: "#5BA63E",         // Darker shade
  LIGHT: "#8ED47D",        // Lighter shade
  VERY_LIGHT: "#D4E8C1",   // Very light background
  TINT_10: "#6CC04A15",    // 10% opacity
  TINT_20: "#6CC04A22",    // 20% opacity
  TINT_50: "#6CC04A80",    // 50% opacity
};

export const getGradient = (direction = "135deg") => {
  return `linear-gradient(${direction}, ${COLORS.PRIMARY} 0%, ${COLORS.LIGHT} 100%)`;
};
