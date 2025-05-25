// ========================
// LineChartCard.js
// ========================
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import ChartCard from "./ChartCard";

export default function LineChartCard({ data, title = "Weekly Revenue" }) {
  return (
    <ChartCard className="h-60">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-cyan-400" />
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
          {title}
        </h3>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ right: 8, left: -20 }}>
          <defs>
            <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />

          <Tooltip
            contentStyle={{ background: "#1e293b", border: "none" }}
            itemStyle={{ color: "#fff" }}
            labelStyle={{ color: "#38bdf8" }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#line-gradient)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
