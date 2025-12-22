// Brand Color Palette - Natural colors
export const COLORS = {
  PRIMARY: "#4CAF50",      // Green - main brand color
  DARK: "#388E3C",         // Darker shade
  DARKER: "#2E7D32",       // Even darker
  DARKEST: "#1B5E20",      // Darkest green
  LIGHT: "#81C784",        // Lighter shade
  LIGHTER: "#A5D6A7",      // Even lighter
  LIGHTEST: "#C8E6C9",     // Lightest green
  VERY_LIGHT: "#E8F5E9",   // Very light background
  TINT_10: "#4CAF5015",    // 10% opacity
  TINT_20: "#4CAF5022",    // 20% opacity
  TINT_50: "#4CAF5080",    // 50% opacity
  
  // Natural colors palette
  BLUE: "#60A5FA",         // Sky blue
  OCEAN: "#0EA5E9",        // Ocean blue
  CORAL: "#F97316",        // Coral/Orange
  SAND: "#D97706",         // Sand/Amber
  FOREST: "#059669",       // Forest green
  EARTH: "#78716C",        // Earth brown
  SUNSET: "#DC2626",       // Sunset red
  ROSE: "#E11D48",         // Rose red
};

export const getGradient = (direction = "135deg") => {
  return `linear-gradient(${direction}, ${COLORS.PRIMARY} 0%, ${COLORS.LIGHT} 100%)`;
};
