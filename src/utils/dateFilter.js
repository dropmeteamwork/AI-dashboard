/**
 * Date filtering utility for time period based filtering
 */

export const getDateRangeForPeriod = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case "day":
      // Today only
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { start: today, end: tomorrow };
    
    case "month":
      // Current month only
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { start: monthStart, end: monthEnd };
    
    case "year":
      // Current year only
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
      return { start: yearStart, end: yearEnd };
    
    case "all":
    default:
      // All time
      return { start: new Date(2000, 0, 1), end: new Date(2100, 0, 1) };
  }
};

export const filterByDatePeriod = (items, period, dateField = "timestamp") => {
  if (period === "all" || !items || items.length === 0) {
    return items;
  }

  const { start, end } = getDateRangeForPeriod(period);

  return items.filter((item) => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= start && itemDate < end;
  });
};

export const filterAnalyticsDataByPeriod = (analyticsData, period) => {
  if (period === "all" || !analyticsData) {
    return analyticsData;
  }

  const { start, end } = getDateRangeForPeriod(period);

  const filterByDate = (items) => {
    if (!items || items.length === 0) return items;
    
    return items.filter(item => {
      // Try multiple date field names
      const dateStr = item.timestamp || item.created_at || item.last_seen || item.date || item.time;
      if (!dateStr) return true; // Keep items without dates
      
      try {
        const itemDate = new Date(dateStr);
        if (isNaN(itemDate)) return true; // Keep invalid dates
        return itemDate >= start && itemDate < end;
      } catch {
        return true; // Keep items that cause errors
      }
    });
  };

  return {
    ...analyticsData,
    accuracy_by_class: filterByDate(analyticsData.accuracy_by_class),
    avg_confidence_by_item: filterByDate(analyticsData.avg_confidence_by_item),
    flag_frequency: filterByDate(analyticsData.flag_frequency),
    predictions_by_model: filterByDate(analyticsData.predictions_by_model),
    model_compare: filterByDate(analyticsData.model_compare),
    brands_summary: filterByDate(analyticsData.brands_summary),
    decision_duration_by_item: filterByDate(analyticsData.decision_duration_by_item),
  };
};

export const recalculateOverview = (filteredAnalytics) => {
  const accuracy = filteredAnalytics?.accuracy_by_class || [];
  const total = accuracy.reduce((s, c) => s + (c.total || 0), 0);
  const accepted = accuracy.reduce((s, c) => s + (c.accepted || 0), 0);
  const rejected = accuracy.reduce((s, c) => s + (c.rejected || 0), 0);

  const avgArr = filteredAnalytics?.avg_confidence_by_item || [];
  const avg =
    avgArr.length > 0
      ? avgArr.reduce((s, c) => s + (c.avg_conf || c.avg_confidence || 0), 0) / avgArr.length
      : 0;

  // Calculate flagged count from flag_frequency data
  const flagFreq = filteredAnalytics?.flag_frequency || [];
  const flagCount = flagFreq.length > 0
    ? flagFreq.reduce((s, f) => s + (f.count || 0), 0)
    : (accuracy.reduce((s, c) => s + (c.flag_count || 0), 0) || 0);

  return {
    total,
    accepted,
    rejected,
    avg_confidence: Math.round(avg * 1000) / 10,
    flagged: flagCount,
  };
};
