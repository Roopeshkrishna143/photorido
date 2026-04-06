import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bookmark, CalendarCheck, Eye, Star, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useVendorAnalytics } from "../../hooks/useVendorData";

const METRICS = [
  { id: "views", label: "Views", icon: Eye, color: "#3b82f6", bg: "bg-blue-50", text: "text-blue-600" },
  { id: "reviews", label: "Reviews", icon: Star, color: "#f59e0b", bg: "bg-amber-50", text: "text-amber-600" },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark, color: "#8b5cf6", bg: "bg-violet-50", text: "text-violet-600" },
  { id: "leads", label: "Leads", icon: Users, color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-600" },
  { id: "bookings", label: "Bookings", icon: CalendarCheck, color: "#f43f5e", bg: "bg-rose-50", text: "text-rose-600" },
];

const DATE_RANGES = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "12m", label: "Last 12 months" },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-xs min-w-[130px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-gray-500 capitalize">{entry.dataKey}</span>
          <span className="font-bold text-gray-800 ml-auto pl-3">{Number(entry.value || 0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryCards({ activeMetrics, summary }: { activeMetrics: string[]; summary: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {METRICS.filter((metric) => activeMetrics.includes(metric.id)).map((metric) => {
        const Icon = metric.icon;
        const total = summary[metric.id] ?? 0;

        return (
          <div key={metric.id} className={`${metric.bg} rounded-2xl p-4 border border-transparent hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${metric.text}`} />
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{total.toLocaleString("en-IN")}</p>
            <p className={`text-xs font-medium mt-0.5 ${metric.text}`}>{metric.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart({
  data,
  activeMetrics,
  chartType,
}: {
  data: Array<Record<string, string | number>>;
  activeMetrics: string[];
  chartType: "area" | "bar" | "line";
}) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-500 py-16 text-center">No analytics data is available for this selection.</p>;
  }

  const xAxis = <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />;
  const yAxis = <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />;
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />;
  const tooltip = <Tooltip content={<CustomTooltip />} />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      {chartType === "bar" ? (
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {activeMetrics.map((metricId) => {
            const metric = METRICS.find((entry) => entry.id === metricId);
            return <Bar key={metricId} dataKey={metricId} fill={metric?.color} radius={[4, 4, 0, 0]} maxBarSize={32} />;
          })}
        </BarChart>
      ) : chartType === "line" ? (
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {activeMetrics.map((metricId) => {
            const metric = METRICS.find((entry) => entry.id === metricId);
            return <Line key={metricId} type="monotone" dataKey={metricId} stroke={metric?.color} strokeWidth={2.5} dot={false} />;
          })}
        </LineChart>
      ) : (
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            {activeMetrics.map((metricId) => {
              const metric = METRICS.find((entry) => entry.id === metricId);
              return (
                <linearGradient key={metricId} id={`gradient-${metricId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric?.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={metric?.color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {activeMetrics.map((metricId) => {
            const metric = METRICS.find((entry) => entry.id === metricId);
            return (
              <Area
                key={metricId}
                type="monotone"
                dataKey={metricId}
                stroke={metric?.color}
                strokeWidth={2.5}
                fill={`url(#gradient-${metricId})`}
                dot={false}
              />
            );
          })}
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}

function BreakdownChart({
  data,
  activeMetrics,
}: {
  data: Array<Record<string, string | number>>;
  activeMetrics: string[];
}) {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900">By Listing</CardTitle>
        <p className="text-xs text-gray-400">Comparison across all listings for the selected metrics.</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {activeMetrics.map((metricId) => {
              const metric = METRICS.find((entry) => entry.id === metricId);
              return <Bar key={metricId} dataKey={metricId} fill={metric?.color} radius={[4, 4, 0, 0]} maxBarSize={24} />;
            })}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function StatisticsPage() {
  const [selectedListing, setSelectedListing] = useState("all");
  const [selectedRange, setSelectedRange] = useState("30d");
  const [activeMetrics, setActiveMetrics] = useState(["views", "reviews", "bookmarks"]);
  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");
  const { analytics, isLoading, error } = useVendorAnalytics(selectedListing, selectedRange);

  const listings = useMemo(
    () => [{ id: "all", label: "All Listings" }, ...analytics.listings],
    [analytics.listings],
  );

  const toggleMetric = (metricId: string) => {
    setActiveMetrics((prev) =>
      prev.includes(metricId)
        ? prev.length > 1
          ? prev.filter((entry) => entry !== metricId)
          : prev
        : [...prev, metricId],
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-500 text-sm mt-1">Track views, reviews, bookmarks, leads, and bookings across your live listings.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Listing</label>
            <select
              value={selectedListing}
              onChange={(event) => setSelectedListing(event.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer truncate"
            >
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date Range</label>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setSelectedRange(range.id)}
                  className={`px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedRange === range.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-white"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Chart Type</label>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
              {(["area", "bar", "line"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-2.5 text-xs font-medium capitalize transition-colors ${
                    chartType === type ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Metrics</label>
          <div className="flex flex-wrap gap-2">
            {METRICS.map((metric) => {
              const Icon = metric.icon;
              const active = activeMetrics.includes(metric.id);

              return (
                <button
                  key={metric.id}
                  onClick={() => toggleMetric(metric.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                  style={active ? { background: metric.color, borderColor: metric.color } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {metric.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error ? (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="py-10 text-center text-red-700">{error}</CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="py-16 text-center text-sm text-gray-500">Loading analytics...</CardContent>
        </Card>
      ) : (
        <>
          <SummaryCards activeMetrics={activeMetrics} summary={analytics.summary} />

          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-900">Trend Overview</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {listings.find((listing) => listing.id === selectedListing)?.label} — {DATE_RANGES.find((range) => range.id === selectedRange)?.label}
              </p>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <TrendChart data={analytics.series} activeMetrics={activeMetrics} chartType={chartType} />
            </CardContent>
          </Card>

          {selectedListing === "all" && <BreakdownChart data={analytics.breakdown} activeMetrics={activeMetrics} />}
        </>
      )}
    </div>
  );
}
