// // Dashboard.jsx
// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Monitor, Bell, Settings, Activity, BarChart3, Download } from "lucide-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { MachinesPerformanceChart, MachinesStatusList } from "@/components/charts/MachineCharts";
// import { ModelPerformanceChart, ModelsConfidenceChart } from "@/components/charts/ModelsCharts";
// import {
//   RealTimeMetricsChart,
// } from "@/components/charts/ProcessingCharts";
// import {
//   RecentPredictionsTimeline,
//   PredictionsConfidenceDistributionChart,
//   AcceptedRejectedChart,
// } from "@/components/charts/PredictionsCharts";
// // import MachineCard from "@/components/charts/MachineCard";
// // import MachinePerformanceModal from "@/components/charts/MachinePerformanceModal";



// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// /**
//  * FINAL Updated Dashboard.jsx
//  * - Apple-style white UI (Shadow Level 1)
//  * - Green theme based on your DropMe logo: primary #8BC34A
//  * - All charts use green family colors
//  * - Brands chart upgraded to a large pie that spans two columns
//  * - Accepted vs Rejected = donut chart
//  * - Confidence Score Distribution = green bars in fixed buckets
//  * - Handles missing/no-data gracefully
//  *
//  * Paste/replace your existing Dashboard.jsx with this file.
//  */

// /* -------------------------
//    Theme (DropMe greens)
//    -------------------------*/
// const THEME = {
//   pageBg: "#FFFFFF",
//   cardBg: "#FFFFFF",
//   primary: "#8BC34A", // DropMe logo green (base)
//   primaryDark: "#6FA632",
//   primaryLight: "#D7EFC0",
//   muted: "#6B7280",
//   text: "#111827",
//   border: "#E8F1E2",
//   subtleBorder: "#F3F7F2",
//   boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
//   danger: "#EF4444",
// };

// /* progressive green palette for pie slices */
// const GREEN_PALETTE = [
//   "#EAF7DA",
//   "#D7F1B4",
//   "#C4EA8F",
//   "#B1E46A",
//   "#9DDF45",
//   "#8BC34A", // primary
//   "#6FA632",
//   "#558223",
// ];

// /* -------------------------
//    Small presentational components
//    -------------------------*/
// const KPI = ({ title, value, note }) => (
//   <div
//     className="rounded-2xl"
//     style={{
//       background: THEME.cardBg,
//       border: `1px solid ${THEME.border}`,
//       boxShadow: THEME.boxShadow,
//     }}
//   >
//     <div
//       className="px-4 py-3 rounded-t-2xl"
//       style={{
//         background: THEME.subtleBorder,
//         borderTopLeftRadius: 12,
//         borderTopRightRadius: 12,
//         borderBottom: `1px solid ${THEME.border}`,
//       }}
//     >
//       <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text }}>{title}</div>
//     </div>
//     <div className="px-4 py-4">
//       <div style={{ fontSize: 20, fontWeight: 700, color: THEME.text }}>{value}</div>
//       {note && <div style={{ fontSize: 12, color: THEME.muted, marginTop: 6 }}>{note}</div>}
//     </div>
//   </div>
// );

// const NoData = ({ text = "No data" }) => (
//   <div style={{ padding: 24, color: THEME.muted, textAlign: "center" }}>{text}</div>
// );

// /* -------------------------
//    Helper utilities
//    -------------------------*/
// const formatDateShort = (iso) => {
//   if (!iso) return "—";
//   try {
//     const d = new Date(iso);
//     return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
//   } catch {
//     return iso;
//   }
// };

// const fetchJson = async (url) => {
//   const r = await fetch(url);
//   if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
//   return r.json();
// };

// /* -------------------------
//    Chart components themed to DropMe green
//    -------------------------*/

// /* Confidence Score Distribution:
//    - buckets: 90-100, 80-89, 70-79, 60-69, <60
//    - input: avg_confidence_by_item (avg_conf 0..1)
// */







// const ConfidenceDistributionChart = ({ data }) => {
//   // prepare buckets
//   const buckets = [
//     { name: "90-100%", min: 0.9, max: 1.0, count: 0 },
//     { name: "80-89%", min: 0.8, max: 0.8999, count: 0 },
//     { name: "70-79%", min: 0.7, max: 0.7999, count: 0 },
//     { name: "60-69%", min: 0.6, max: 0.6999, count: 0 },
//     { name: "<60%", min: 0.0, max: 0.5999, count: 0 },
//   ];

//   if (!Array.isArray(data) || data.length === 0) {
//     return <NoData text="No confidence data" />;
//   }

//   data.forEach((it) => {
//     const v = (it.avg_conf || it.avg_confidence || 0);
//     const b = buckets.find((bk) => v >= bk.min && v <= bk.max);
//     if (b) b.count += 1;
//   });

//   const chartData = buckets.map((b, i) => ({ name: b.name, count: b.count, color: GREEN_PALETTE[Math.min(i + 2, GREEN_PALETTE.length - 1)] }));

//   const max = Math.max(...chartData.map((d) => d.count), 1);

//   return (
//     <div style={{ width: "100%", height: 260 }}>
//       <ResponsiveContainer>
//         <BarChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 40 }}>
//           <CartesianGrid stroke={THEME.subtleBorder} strokeDasharray="3 3" />
//           <XAxis dataKey="name" tick={{ fill: THEME.muted }} />
//           <YAxis allowDecimals={false} tick={{ fill: THEME.muted }} domain={[0, Math.max(3, max)]} />
//           <Tooltip wrapperStyle={{ background: "#fff", border: `1px solid ${THEME.border}` }} />
//           <Bar dataKey="count" name="Items" radius={[6, 6, 0, 0]}>
//             {chartData.map((entry, idx) => (
//               <Cell key={`c-${idx}`} fill={entry.color} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// /* Accepted vs Rejected donut (Pie with innerRadius) */
// const AcceptedRejectedDonut = ({ data }) => {
//   // data = accuracy_by_class
//   if (!Array.isArray(data) || data.length === 0) {
//     return <NoData text="No acceptance data" />;
//   }

//   const totalAccepted = data.reduce((s, it) => s + (it.accepted || 0), 0);
//   const totalRejected = data.reduce((s, it) => s + (it.rejected || 0), 0);
//   const pieData = [
//     { name: "Accepted", value: totalAccepted, color: THEME.primary },
//     { name: "Rejected", value: totalRejected, color: THEME.danger },
//   ];

//   if (totalAccepted + totalRejected === 0) {
//     return <NoData text="No accepted/rejected data" />;
//   }

//   return (
//     <div style={{ width: "100%", height: 260 }}>
//       <ResponsiveContainer>
//         <PieChart>
//           <Tooltip wrapperStyle={{ background: "#fff", border: `1px solid ${THEME.border}` }} />
//           <Legend verticalAlign="bottom" wrapperStyle={{ color: THEME.muted }} />
//           <Pie
//             data={pieData}
//             dataKey="value"
//             nameKey="name"
//             innerRadius={70}
//             outerRadius={100}
//             paddingAngle={6}
//             label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
//           >
//             {pieData.map((entry, idx) => (
//               <Cell key={`arc-${idx}`} fill={entry.color} />
//             ))}
//           </Pie>
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// /* Brands large pie chart — spans two columns in layout.
//    Show top slice labels and a scrollable legend with small avatars (initials).
// */
// const BrandsPieChartLarge = ({ data }) => {
//   if (!Array.isArray(data) || data.length === 0) {
//     return <NoData text="No brand summary data" />;
//   }

//   // sort and keep the top N slices if too many (we'll keep all but the palette repeats)
//   const sorted = [...data].sort((a, b) => b.total - a.total);
//   // keep all, but map colors by index
//   const pieData = sorted.map((d, i) => ({
//     name: d.brand,
//     value: d.total,
//     last_seen: d.last_seen,
//     color: GREEN_PALETTE[i % GREEN_PALETTE.length],
//   }));

//   const totalAll = pieData.reduce((s, p) => s + p.value, 0) || 1;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
//       <div style={{ width: "100%", height: 360 }}>
//         <ResponsiveContainer>
//           <PieChart>
//             <Tooltip
//               formatter={(value, name, props) => [`${value}`, `${name}`]}
//               wrapperStyle={{ background: "#fff", border: `1px solid ${THEME.border}` }}
//             />
//             <Legend verticalAlign="bottom" wrapperStyle={{ color: THEME.muted }} />
//             <Pie
//               data={pieData}
//               dataKey="value"
//               nameKey="name"
//               outerRadius={130}
//               // label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
//             >
//               {pieData.map((entry, idx) => (
//                 <Cell key={`b-${idx}`} fill={entry.color} />
//               ))}
//             </Pie>
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       <div style={{ maxHeight: 360, overflowY: "auto", padding: 8 }}>
//         {pieData.map((p, idx) => (
//           <div
//             key={p.name}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 12,
//               padding: 8,
//               border: `1px solid ${THEME.subtleBorder}`,
//               borderRadius: 8,
//               marginBottom: 8,
//               background: THEME.cardBg,
//               boxShadow: THEME.boxShadow,
//             }}
//           >
//             <div
//               style={{
//                 width: 44,
//                 height: 44,
//                 borderRadius: 10,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 background: "#F7FFF4",
//                 color: THEME.primaryDark,
//                 fontWeight: 700,
//                 fontSize: 16,
//                 border: `1px solid ${THEME.border}`,
//               }}
//             >
//               {/* initial or digit */}
//               {String(p.name).trim().charAt(0).toUpperCase()}
//             </div>

//             <div style={{ flex: 1 }}>
//               <div style={{ fontSize: 14, fontWeight: 700, color: THEME.text }}>{p.name}</div>
//               <div style={{ fontSize: 12, color: THEME.muted }}>last seen: {formatDateShort(p.last_seen)}</div>
//             </div>

//             <div style={{ fontWeight: 800, color: THEME.text, minWidth: 48, textAlign: "right" }}>{p.value}</div>
//             <div style={{ width: 12, height: 12, background: p.color, borderRadius: 4 }} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// /* Generic simple small bar chart for flag frequency (green family) */
// const FlagFrequencyChart = ({ data }) => {
//   if (!Array.isArray(data) || data.length === 0) return <NoData text="No flag data" />;

//   const chartData = data.map((d, i) => ({ name: d.flag, count: d.count, color: GREEN_PALETTE[i % GREEN_PALETTE.length] }));
//   return (
//     <div style={{ width: "100%", height: 260 }}>
//       <ResponsiveContainer>
//         <BarChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 40 }}>
//           <CartesianGrid stroke={THEME.subtleBorder} strokeDasharray="3 3" />
//           <XAxis dataKey="name" tick={{ fill: THEME.muted }} />
//           <YAxis tick={{ fill: THEME.muted }} />
//           <Tooltip wrapperStyle={{ background: "#fff", border: `1px solid ${THEME.border}` }} />
//           <Bar dataKey="count" radius={[6, 6, 0, 0]}>
//             {chartData.map((entry, idx) => <Cell key={`f-${idx}`} fill={entry.color} />)}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// /* Model distribution bar chart (green) */
// const ModelCompareChart = ({ data }) => {
//   if (!Array.isArray(data) || data.length === 0) return <NoData text="No model data" />;
//   const chartData = data.map((d, i) => ({ name: d.model_used, count: d.count, color: GREEN_PALETTE[i % GREEN_PALETTE.length] }));
//   return (
//     <div style={{ width: "100%", height: 260 }}>
//       <ResponsiveContainer>
//         <BarChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 40 }}>
//           <CartesianGrid stroke={THEME.subtleBorder} strokeDasharray="3 3" />
//           <XAxis dataKey="name" tick={{ fill: THEME.muted }} />
//           <YAxis tick={{ fill: THEME.muted }} />
//           <Tooltip wrapperStyle={{ background: "#fff", border: `1px solid ${THEME.border}` }} />
//           <Bar dataKey="count" radius={[6, 6, 0, 0]}>
//             {chartData.map((entry, idx) => <Cell key={`m-${idx}`} fill={entry.color} />)}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// /* Brands (small vertical leaderboard) — already handled inside BrandsPieChartLarge by legend area */

// /* Accuracy by class chart (green stacked accepted/rejected) */
// const AccuracyByClassChart = ({ data }) => {
//   if (!Array.isArray(data) || data.length === 0) return <NoData text="No accuracy data" />;
//   const chartData = data.map((d) => ({ name: d.item, accepted: d.accepted || 0, rejected: d.rejected || 0 }));
//   return (
//     <div style={{ width: "100%", height: 300 }}>
//       <ResponsiveContainer>
//         <BarChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 50 }}>
//           <CartesianGrid stroke={THEME.subtleBorder} strokeDasharray="3 3" />
//           <XAxis dataKey="name" angle={-40} textAnchor="end" interval={0} height={70} tick={{ fill: THEME.muted }} />
//           <YAxis tick={{ fill: THEME.muted }} />
//           <Tooltip wrapperStyle={{ background: "#fff", border: `1px solid ${THEME.border}` }} />
//           <Legend wrapperStyle={{ color: THEME.muted }} />
//           <Bar dataKey="accepted" stackId="a" name="Accepted" fill={THEME.primary} radius={[6, 6, 0, 0]} />
//           <Bar dataKey="rejected" stackId="a" name="Rejected" fill={THEME.danger} radius={[6, 6, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// /* -------------------------
//    Main Dashboard component (keeps your existing API flow)
//    -------------------------*/

// const ANALYTICS_URL = "/api/analytics/";

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [overview, setOverview] = useState({ total: 0, avg_confidence: 0, flagged: 0, active_machines: "—", accepted: 0, rejected: 0 });
//   const [analytics, setAnalytics] = useState(null);
//   const [machines, setMachines] = useState([]);
//   const [period, setPeriod] = useState("7days");
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState(null);

//   // const [modalOpen, setModalOpen] = useState(false);

//   // useEffect(() => {
//   //   fetch("/api/machines")
//   //     .then(res => res.json())
//   //     .then(data => setMachinesData(data))
//   //     .catch(console.error);
//   // }, []); 


//   useEffect(() => {
//     let cancelled = false;
//     const load = async () => {
//       setLoading(true);
//       setErr(null);
//       try {
//         const [analyticsResp, machinesResp] = await Promise.all([
//           fetchJson(ANALYTICS_URL),
//           fetchJson("/api/machines/"),
//         ]);
//         if (cancelled) return;

//         setAnalytics(analyticsResp || null);
//         setMachines(Array.isArray(machinesResp) ? machinesResp : []);

//         const classes = analyticsResp?.accuracy_by_class || [];
//         const totalProcessed = classes.reduce((s, c) => s + (c.total || 0), 0);
//         const accepted = classes.reduce((s, c) => s + (c.accepted || 0), 0);
//         const rejected = classes.reduce((s, c) => s + (c.rejected || 0), 0);

//         const avgConfArr = analyticsResp?.avg_confidence_by_item || [];
//         const avgConf =
//           avgConfArr.length > 0
//             ? (avgConfArr.reduce((s, c) => s + (c.avg_conf || c.avg_confidence || 0), 0) / avgConfArr.length) || 0
//             : 0;

//         const flagged = (analyticsResp?.flagged_by_class || []).reduce((s, f) => s + (f.flag_count || 0), 0);
//         const flaggedFallback = analyticsResp?.flagged_count || analyticsResp?.flagged_items || 0;
//         const flaggedTotal = flagged || flaggedFallback || 0;

//         const activeMachines = Array.isArray(machinesResp) ? machinesResp.filter((m) => m.online).length + "/" + machinesResp.length : "—";

//         setOverview({
//           total: totalProcessed,
//           avg_confidence: Math.round(avgConf * 1000) / 10,
//           flagged: flaggedTotal,
//           active_machines: activeMachines,
//           accepted,
//           rejected,
//         });
//       } catch (error) {
//         console.error("Dashboard load error", error);
//         setErr(error.message || "Failed to load analytics");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };
//     load();
//     return () => (cancelled = true);
//   }, [refreshKey]);

//   const refreshAll = () => setRefreshKey((k) => k + 1);

//   // getters — safely read from analytics
//   const accuracyByClass = analytics?.accuracy_by_class || [];
//   const avgConfByItem = analytics?.avg_confidence_by_item || [];
//   const flagFrequency = analytics?.flag_frequency || [];
//   const modelCompare = analytics?.model_compare || analytics?.predictions_by_model || [];
//   const brandsSummary = analytics?.brands_summary || [];
//   const topModel = (analytics?.predictions_by_model || []).slice().sort((a, b) => b.count - a.count)[0];

//   /* ---------- Layout ---------- */
//   return (
//     <div className="min-h-screen" style={{ background: THEME.pageBg, color: THEME.text }}>
//       {/* Header */}
//       <header style={{ background: THEME.pageBg, borderBottom: `1px solid ${THEME.border}` }} className="px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-3">
//               <div
//                 style={{
//                   width: 44,
//                   height: 44,
//                   background: THEME.primary,
//                   borderRadius: 10,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   boxShadow: THEME.boxShadow,
//                 }}
//               >
//                 <Monitor className="w-5 h-5" style={{ color: "#fff" }} />
//               </div>
//               <div>
//                 <h1 className="text-xl font-semibold" style={{ color: THEME.text }}>AI Engineer Dashboard</h1>
//                 <div style={{ fontSize: 12, color: THEME.muted }}>Sustainability Insights</div>
//               </div>
//             </div>

//             <div style={{ marginLeft: 8 }}>
//               <Badge style={{ background: "#F6FFF2", border: `1px solid ${THEME.border}`, color: THEME.primary }}>
//                 <div style={{ display: "inline-flex", width: 8, height: 8, background: THEME.primary, borderRadius: 100, marginRight: 8 }} />
//                 All Systems Online
//               </Badge>
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//      <Button
//   variant="outline"
//   size="sm"
//   onClick={refreshAll}
//   className="flex items-center"
//   style={{ borderColor: THEME.subtleBorder }}
// >
//   <Bell className="w-4 h-4 mr-2" />
//   Refresh
// </Button>

// <Button
//   variant="outline"
//   size="sm"
//   onClick={async () => {
//     try {
//       // Assuming you store the refresh token in localStorage after login
//       const refreshToken = localStorage.getItem("refresh_token");
//       if (!refreshToken) {
//         alert("No refresh token found. Are you logged in?");
//         return;
//       }

//       const res = await fetch(
//         "https://web-ai-dashboard.up.railway.app/ai_dashboard/dashboard-admin/logout/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("access_token")}`, // optional if protected
//           },
//           body: JSON.stringify({ refresh: refreshToken }),
//         }
//       );

//       if (res.ok) {
//         alert("Logged out successfully");
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("refresh_token");
//         // Optionally redirect to login page
//         window.location.href = "/login";
//       } else {
//         const data = await res.json();
//         alert("Logout failed: " + (data.error || res.statusText));
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Logout error");
//     }
//   }}
//   className="flex items-center ml-2"
//   style={{ borderColor: THEME.subtleBorder }}
// >
//   <Settings className="w-4 h-4 mr-2" />
//   Logout
// </Button>

//             {/* <Button variant="outline" size="sm" className="flex items-center" style={{ borderColor: THEME.subtleBorder }}>
//               <Settings className="w-4 h-4 mr-2" />
//               Settings
//             </Button> */}

//             <div className="flex items-center space-x-2">
//               <div style={{ width: 34, height: 34, background: "#F3F4F6", borderRadius: 8 }} />
//               <span className="text-sm font-medium" style={{ color: THEME.text }}>AI Engineer</span>
//             </div>
//           </div>
//         </div>
//       </header>


//       <div className="flex">
//         {/* Sidebar */}
//         <aside style={{ width: 260, background: THEME.cardBg, borderRight: `1px solid ${THEME.border}`, minHeight: "100vh" }}>
     

//           <div style={{ padding: 16 }}>
//             <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//               {["overview", "machines", "flags", "models", "analytics"].map((t) => (
//                 <button
//                   key={t}
//                   onClick={() => setActiveTab(t)}
//                   className={`w-full text-left px-4 py-2 rounded-lg transition-colors`}
//                   style={{
//                     background: activeTab === t ? THEME.primary : "transparent",
//                     color: activeTab === t ? "#fff" : THEME.text,
//                     border: activeTab === t ? `1px solid ${THEME.primary}` : `1px solid transparent`,
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 10,
//                     boxShadow: activeTab === t ? THEME.boxShadow : "none",
//                   }}
//                 >
//                   <Activity className="w-4 h-4" style={{ color: activeTab === t ? "#fff" : THEME.primary }} />
//                   <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{t}</span>
//                 </button>
//               ))}
//             </nav>
//           </div>

//           <div style={{ padding: 16, borderTop: `1px solid ${THEME.subtleBorder}` }}>
//             <h3 style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginBottom: 8 }}>Quick Stats</h3>
//             <div style={{ display: "grid", gap: 10 }}>
//               <div style={{ display: "flex", justifyContent: "space-between", color: THEME.muted }}>
//                 <span style={{ fontSize: 13 }}>Total Items Processed</span>
//                 <Badge style={{ background: "#F6FFF2", color: THEME.primary, padding: "6px 8px", borderRadius: 8 }}>{overview.total}</Badge>
//               </div>
//               <div style={{ display: "flex", justifyContent: "space-between", color: THEME.muted }}>
//                 <span style={{ fontSize: 13 }}>Average Confidence</span>
//                 <Badge style={{ background: "#F6FFF2", color: THEME.primary, padding: "6px 8px", borderRadius: 8 }}>{overview.avg_confidence}%</Badge>
//               </div>
//               <div style={{ display: "flex", justifyContent: "space-between", color: THEME.muted }}>
//                 <span style={{ fontSize: 13 }}>Flagged Items</span>
//                 <Badge style={{ background: "#FFF7ED", color: "#D97706", padding: "6px 8px", borderRadius: 8 }}>{overview.flagged}</Badge>
//               </div>
//               <div style={{ display: "flex", justifyContent: "space-between", color: THEME.muted }}>
//                 <span style={{ fontSize: 13 }}>Active Machines</span>
//                 <span style={{ fontSize: 13, color: THEME.muted }}>{overview.active_machines}</span>
//               </div>
//             </div>
//           </div>

//           <div style={{ padding: 16, borderTop: `1px solid ${THEME.subtleBorder}` }}>
//             <h3 style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginBottom: 8 }}>Machines</h3>
//             <MachinesStatusList onSelect={(m) => { /* no-op */ }} />
//           </div>
//         </aside>

//         {/* Main */}
//         <main style={{ flex: 1, padding: 24 }}>
//           {/* Overview */}
//           {activeTab === "overview" && (
//             <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
//               <div>
//                 <h2 style={{ fontSize: 28, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>Data Flow Architecture</h2>
//                 <div style={{ color: THEME.muted }}>Complete journey from input sources to verified sustainability reports</div>
//               </div>

//               {/* KPIs */}
//               <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 20 }}>
//                 <KPI title="Total Items Processed" value={overview.total} note="From analytics" />
//                 <KPI title="Average Confidence" value={`${overview.avg_confidence}%`} note="From analytics" />
//                 <KPI title="Flagged Items" value={overview.flagged} note="Awaiting review" />
//                 <div
//                   className="rounded-2xl"
//                   style={{
//                     background: THEME.cardBg,
//                     border: `1px solid ${THEME.border}`,
//                     boxShadow: THEME.boxShadow,
//                   }}
//                 >
//                   <div
//                     className="px-4 py-3 rounded-t-2xl"
//                     style={{
//                       background: THEME.subtleBorder,
//                       borderBottom: `1px solid ${THEME.border}`,
//                       borderTopLeftRadius: 12,
//                       borderTopRightRadius: 12,
//                     }}
//                   >
//                     <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text }}>Top Model</div>
//                   </div>

//                   <div className="px-4 py-4">
//                     <div style={{ fontSize: 16, fontWeight: 700, color: THEME.text }}>{topModel ? topModel.model_used : "—"}</div>
//                     <div style={{ fontSize: 12, color: THEME.muted }}>{topModel ? `${topModel.count} detections` : "No data"}</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Two column section */}
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//                 {/* <div
//                   className="rounded-2xl"
//                   style={{
//                     border: `1px solid ${THEME.border}`,
//                     background: THEME.cardBg,
//                     boxShadow: THEME.boxShadow,
//                   }}
//                 > */}
//                   {/* <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}> */}
//                     {/* <div style={{ display: "flex", alignItems: "center", gap: 10 }}> */}
//                       {/* <BarChart3 className="w-5 h-5" style={{ color: THEME.primary }} /> */}
//                       {/* <div style={{ fontWeight: 700, color: THEME.text }}>Processing Overview</div> */}
//                     {/* </div> */}
//                     {/* <div style={{ fontSize: 12, color: THEME.muted }}>Real-time processing metrics</div> */}
//                   {/* </div> */}
//                   {/* <div style={{ padding: 16 }}>
//                     <RealTimeMetricsChart />
//                   </div> */}
//                 {/* </div> */}

//                 <div
//                   className="rounded-2xl"
//                   style={{
//                     border: `1px solid ${THEME.border}`,
//                     background: THEME.cardBg,
//                     boxShadow: THEME.boxShadow,
//                   }}
//                 >
//                   <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
//                     <div style={{ fontWeight: 700, color: THEME.text }}>Recent Predictions</div>
//                     <div style={{ fontSize: 12, color: THEME.muted }}>Activity from predictions</div>
//                   </div>
//                   <div style={{ padding: 16 }}>
//                     <RecentPredictionsTimeline />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

    
//           {/* Machines tab */}
//           {activeTab === "machines" && (
//             <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//               <h2 style={{ fontSize: 22, fontWeight: 700, color: THEME.text }}>Machine Monitoring</h2>
//               <div
//                 className="rounded-2xl"
//                 style={{
//                   border: `1px solid ${THEME.border}`,
//                   background: THEME.cardBg,
//                   boxShadow: THEME.boxShadow,
//                 }}
//               >
//                 <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder }}>
//                   <div style={{ fontWeight: 700, color: THEME.text }}>Machine Performance</div>
//                   <div style={{ fontSize: 12, color: THEME.muted }}>Comparison across all units</div>
//                 </div>
//                 <div style={{ padding: 16 }}>
//                   <MachinesPerformanceChart />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Models tab */}
//           {activeTab === "models" && (
//             <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//               <h2 style={{ fontSize: 22, fontWeight: 700, color: THEME.text }}>AI Models</h2>
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//                 <div
//                   className="rounded-2xl"
//                   style={{
//                     border: `1px solid ${THEME.border}`,
//                     background: THEME.cardBg,
//                     boxShadow: THEME.boxShadow,
//                   }}
//                 >
//                   <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder }}>
//                     <div style={{ fontWeight: 700, color: THEME.text }}>Model Performance (30 days)</div>
//                   </div>
//                   <div style={{ padding: 16 }}>
//                     <ModelPerformanceChart days={30} />
//                   </div>
//                 </div>

//                 <div
//                   className="rounded-2xl"
//                   style={{
//                     border: `1px solid ${THEME.border}`,
//                     background: THEME.cardBg,
//                     boxShadow: THEME.boxShadow,
//                   }}
//                 >
//                   <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder }}>
//                     <div style={{ fontWeight: 700, color: THEME.text }}>Model Confidence Comparison</div>
//                   </div>
//                   <div style={{ padding: 16 }}>
//                     <ModelsConfidenceChart />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Analytics tab */}
//           {activeTab === "analytics" && (
//             <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                 <h2 style={{ fontSize: 22, fontWeight: 700, color: THEME.text }}>Analytics & Insights</h2>
//                 <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                   <Select value={period} onValueChange={(v) => setPeriod(v)}>
//                     <SelectTrigger className="w-32">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="24h">Last 24h</SelectItem>
//                       <SelectItem value="7days">Last 7 days</SelectItem>
//                       <SelectItem value="30days">Last 30 days</SelectItem>
//                     </SelectContent>
//                   </Select>

//                   <Button variant="outline" onClick={refreshAll} style={{ borderColor: THEME.subtleBorder }}>
//                     <Download className="w-4 h-4 mr-2" />
//                     Export Report
//                   </Button>
//                 </div>
//               </div>

//               {err && <div style={{ color: "#DC2626" }}>Error: {err}</div>}
//               {loading && <div style={{ color: THEME.muted }}>Loading analytics...</div>}

//               {/* Top row of analytics charts */}
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//                 <div
//                   className="rounded-2xl"
//                   style={{ border: `1px solid ${THEME.border}`, background: THEME.cardBg, boxShadow: THEME.boxShadow }}
//                 >
//                   <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder }}>
//                     <div style={{ fontWeight: 700, color: THEME.text }}>Classification Distribution</div>
//                     <div style={{ fontSize: 12, color: THEME.muted }}>Breakdown by class</div>
//                   </div>
//                   <div style={{ padding: 16 }}>
//                     <AccuracyByClassChart data={accuracyByClass} />
//                   </div>
//                 </div>

//                 <div
//                   className="rounded-2xl"
//                   style={{ border: `1px solid ${THEME.border}`, background: THEME.cardBg, boxShadow: THEME.boxShadow }}
//                 >
//                   <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder }}>
//                     <div style={{ fontWeight: 700, color: THEME.text }}>Avg Confidence by Item</div>
//                     <div style={{ fontSize: 12, color: THEME.muted }}>Model confidence per item</div>
//                   </div>
//                   <div style={{ padding: 16 }}>
//                     <ConfidenceDistributionChart data={avgConfByItem} />
//                   </div>
//                 </div>
//               </div>

//               {/* Brands large pie (spans two columns visually) */}
//               <div
//                 className="rounded-2xl"
//                 style={{
//                   border: `1px solid ${THEME.border}`,
//                   background: THEME.cardBg,
//                   boxShadow: THEME.boxShadow,
//                   padding: 16,
//                 }}
//               >
//                 <div style={{ marginBottom: 12 }}>
//                   <div style={{ fontWeight: 700, color: THEME.text }}>Brand Summary</div>
//                   <div style={{ fontSize: 12, color: THEME.muted }}>Top detected brands (last seen)</div>
//                 </div>

//                 <BrandsPieChartLarge data={brandsSummary} />
//               </div>

//               {/* Bottom analytics row */}
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//                 <div
//                   className="rounded-2xl"
//                   style={{ border: `1px solid ${THEME.border}`, background: THEME.cardBg, boxShadow: THEME.boxShadow }}
//                 >
//                   <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder }}>
//                     <div style={{ fontWeight: 700, color: THEME.text }}>Confidence Score Distribution</div>
//                     <div style={{ fontSize: 12, color: THEME.muted }}>From recent predictions</div>
//                   </div>
//                   <div style={{ padding: 16 }}>
//                     {/* Reuse ConfidenceDistributionChart — if you prefer a histogram of raw predictions we would need raw predictions array */}
//                     <ConfidenceDistributionChart data={avgConfByItem} />
//                   </div>
//                 </div>

//                 <div
//                   className="rounded-2xl"
//                   style={{ border: `1px solid ${THEME.border}`, background: THEME.cardBg, boxShadow: THEME.boxShadow }}
//                 >
//                   <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder }}>
//                     <div style={{ fontWeight: 700, color: THEME.text }}>Accepted vs Rejected</div>
//                     <div style={{ fontSize: 12, color: THEME.muted }}>Predictions status</div>
//                   </div>
//                   <div style={{ padding: 16 }}>
//                     <AcceptedRejectedDonut data={accuracyByClass} />
//                   </div>
//                 </div>
//               </div>

//               {/* Additional charts */}
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//                 <div
//                   className="rounded-2xl"
//                   style={{ border: `1px solid ${THEME.border}`, background: THEME.cardBg, boxShadow: THEME.boxShadow }}
//                 >
//                   <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder }}>
//                     <div style={{ fontWeight: 700, color: THEME.text }}>Flag Frequency</div>
//                     <div style={{ fontSize: 12, color: THEME.muted }}>Which flags happen most</div>
//                   </div>
//                   <div style={{ padding: 16 }}>
//                     <FlagFrequencyChart data={flagFrequency} />
//                   </div>
//                 </div>

//                 <div
//                   className="rounded-2xl"
//                   style={{ border: `1px solid ${THEME.border}`, background: THEME.cardBg, boxShadow: THEME.boxShadow }}
//                 >
//                   <div style={{ padding: 16, borderBottom: `1px solid ${THEME.border}`, background: THEME.subtleBorder }}>
//                     <div style={{ fontWeight: 700, color: THEME.text }}>Model Compare</div>
//                     <div style={{ fontSize: 12, color: THEME.muted }}>Detections per model</div>
//                   </div>
//                   <div style={{ padding: 16 }}>
//                     <ModelCompareChart data={modelCompare} />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
