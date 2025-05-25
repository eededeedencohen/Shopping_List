// ========================
// BarChartCard.js
// ========================
import { ResponsiveContainer, BarChart, Bar, Tooltip, XAxis } from "recharts";
import { BarChart2 } from "lucide-react";
import ChartCard from "./ChartCard";

export default function BarChartCard({ data, title = "Monthly Users" }) {
  return (
    <ChartCard className="h-56">
      <div className="flex items-center gap-2 mb-2">
        <BarChart2 className="h-5 w-5 text-fuchsia-400" />
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
          {title}
        </h3>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ right: 8, left: -20 }}>
          <defs>
            <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />

          <Tooltip
            contentStyle={{ background: "#1e293b", border: "none" }}
            itemStyle={{ color: "#fff" }}
            labelStyle={{ color: "#f472b6" }}
          />

          <Bar
            dataKey="value"
            fill="url(#bar-gradient)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
